// Requires access to the TIX API. Purchases access to the 4S Mkt Data API as soon as it can
import {
	formatMoney,
	formatNumber,
	formatPercentage,
	formatTime,
	getPortNumbers,
	modifyFile,
	printBoth,
	symbolToServer
} from '/utils.js';

let disableShorts = false;
let commission = 100000; // Buy/sell commission. Expected profit must exceed this to buy anything.
let totalProfit = 0; // We can keep track of how much we've earned since start.
let mock = false; // If set to true, will "mock" buy/sell but not actually buy/sell anything
// Pre-4S configuration (influences how we play the stock market before we have 4S data, after which everything's fool-proof)
let minTickHistory; // This much history must be gathered before we will offer a stock forecast.
let longTermForecastWindowLength; // This much history will be used to determine the historical probability of the stock (so long as no inversions are detected)
let nearTermForecastWindowLength; // This much history will be used to detect recent negative trends and act on them immediately.
// The following pre-4s constants are hard-coded (not configurable via command line) but may require tweaking
const marketCycleLength = 75; // Every this many ticks, all stocks have a 45% chance of "reversing" their probability. Something we must detect and act on quick to not lose profits.
const maxTickHistory = 151; // This much history will be kept for purposes of determining volatility and perhaps one day pinpointing the market cycle tick
const inversionDetectionTolerance = 0.1; // If the near-term forecast is within this distance of (1 - long-term forecast), consider it a potential "inversion"
const inversionLagTolerance = 5; // An inversion is "trusted" up to this many ticks after the normal nearTermForecastWindowLength expected detection time
// (Note: 33 total stocks * 45% inversion chance each cycle = ~15 expected inversions per cycle)
// The following pre-4s values are set during the lifetime of the program
let marketCycleDetected = false; // We should not make risky purchasing decisions until the stock market cycle is detected. This can take a long time, but we'll be thanked
let detectedCycleTick = 0; // This will be reset to zero once we've detected the market cycle point.
let inversionAgreementThreshold = 6; // If this many stocks are detected as being in an "inversion", consider this the stock market cycle point
const expectedTickTime = 6000;
const catchUpTickTime = 4000;
let lastTick = 0;
let sleepInterval = 1000;
const portNumber = getPortNumbers().stock;

const argsSchema = [
	['liquidate', false], // Stop any other running instances and sell all stocks
	['mock', false], // If set to true, will "mock" buy/sell but not actually buy/sell anything
	['disable-shorts', false], // If set to true, will disable shorting
	['reserve', 0], // A fixed amount of money to not spend
	['fracB', 0.4], // Fraction of assets to have as liquid before we consider buying more stock
	['fracH', 0.2], // Fraction of assets to retain as cash in hand when buying
	['buy-threshold', 0.0001], // Buy only stocks forecasted to earn better than a 0.01% return (1 Basis Point)
	['sell-threshold', 0], // Sell stocks forecasted to earn less than this return (default 0% - which happens when prob hits 50% or worse)
	['diversification', 0.34], // Before we have 4S data, we will not hold more than this fraction of our portfolio as a single stock
	['disableHud', false], // Disable showing stock value in the HUD panel
	// The following settings are related only to tweaking pre-4s stock-market logic
	['pre-4s-buy-threshold-probability', 0.15], // Before we have 4S data, only buy stocks whose probability is more than this far away from 0.5, to account for imprecision
	['pre-4s-buy-threshold-return', 0.0015], // Before we have 4S data, Buy only stocks forecasted to earn better than this return (default 0.25% or 25 Basis Points)
	['pre-4s-sell-threshold-return', 0.0005], // Before we have 4S data, Sell stocks forecasted to earn less than this return (default 0.15% or 15 Basis Points)
	['pre-4s-min-tick-history', 21], // This much history must be gathered before we will use pre-4s stock forecasts to make buy/sell decisions. (Default 21)
	['pre-4s-forecast-window', 51], // This much history will be used to determine the historical probability of the stock (so long as no inversions are detected) (Default 76)
	['pre-4s-inversion-detection-window', 10], // This much history will be used to detect recent negative trends and act on them immediately. (Default 10)
	['pre-4s-min-blackout-window', 10], // Do not make any new purchases this many ticks before the detected stock market cycle tick, to avoid buying a position that reverses soon after
	['pre-4s-minimum-hold-time', 10] // A recently bought position must be held for this long before selling, to avoid rash decisions due to noise after a fresh market cycle. (Default 10)
];

export function autocomplete(data) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	// Extract various options from the args (globals, purchasing decision factors, pre-4s factors)
	const options = ns.flags(argsSchema);
	mock = options.mock;
	const fracB = options.fracB;
	const fracH = options.fracH;
	const diversification = options.diversification;
	const disableHud = options.disableHud || options.liquidate || options.mock;
	disableShorts = options['disable-shorts'];
	const pre4sBuyThresholdProbability = options['pre-4s-buy-threshold-probability'];
	const pre4sMinBlackoutWindow = options['pre-4s-min-blackout-window'] || 1;
	const pre4sMinHoldTime = options['pre-4s-minimum-hold-time'] || 0;
	minTickHistory = options['pre-4s-min-tick-history'] || 21;
	nearTermForecastWindowLength = options['pre-4s-inversion-detection-window'] || 10;
	longTermForecastWindowLength = options['pre-4s-forecast-window'] || (marketCycleLength + 1);
	// Other global values must be reset at start lest they be left in memory from a prior run
	lastTick = 0;
	totalProfit = 0;
	marketCycleDetected = false;
	detectedCycleTick = 0;
	inversionAgreementThreshold = 6;
	let corpus = 0;
	let myStocks = [];
	let allStocks = [];
	if (!ns.stock.hasTIXAPIAccess()) { // You cannot use the autopilot until you have API access
		return printBoth(ns, `ERROR: You have to buy WSE account and TIX API access before you can run this script`);
	}
	if (options.liquidate) { // If given the "liquidate" command, try to kill the version of ourselves trading in stocks
		ns.ps().filter(p => p.filename === ns.getScriptName() && !p.args.includes('--l') &&
			!p.args.includes('--liquidate')).forEach(p => ns.kill(p.pid));
	}
	if (!disableShorts && ns.getPlayer().bitNodeN !== 8 && !ns.singularity.getOwnedSourceFiles().some(s => s.n === 8 && s.lvl > 1)) {
		ns.print(`INFO: Shorting stocks has been disabled (you have not yet unlocked access to shorting)`);
		disableShorts = true;
	}
	// Initialise all stocks
	allStocks = initAllStocks(ns);
	if (options.liquidate) {
		liquidate(ns); // Sell all stocks
		return;
	}
	// Assume Bitnode mults are 1 if user doesn't have this API access yet
	const bitnodeMults = ns.getPlayer().bitNodeN === 5 || ns.singularity.getOwnedSourceFiles().includes(s => s.n === 5) ?
		ns.getBitNodeMultipliers() : {FourSigmaMarketDataCost: 1, FourSigmaMarketDataApiCost: 1};
	let hudElement = null;
	if (!disableHud) {
		hudElement = initializeHud();
		ns.atExit(() => hudElement.parentElement.parentElement.parentElement.removeChild(hudElement.parentElement.parentElement));
	}
	// noinspection InfiniteLoopJS
	while (true) {
		const playerStats = ns.getPlayer();
		const pre4s = !ns.stock.has4SDataTIXAPI();
		corpus = await refresh(ns, playerStats, allStocks, myStocks);
		if (pre4s && !mock && tryGet4SApi(ns, playerStats, bitnodeMults, corpus)) continue; // Start the loop over if we just bought 4S API access
		// Be more conservative with our decisions if we don't have 4S data
		const thresholdToBuy = pre4s ? options['pre-4s-buy-threshold-return'] : options['buy-threshold'];
		const thresholdToSell = pre4s ? options['pre-4s-sell-threshold-return'] : options['sell-threshold'];
		if (myStocks.length > 0) doStatusUpdate(ns, allStocks, myStocks, hudElement);
		else if (hudElement) hudElement.innerText = '$0.000 ';
		if (pre4s && allStocks[0].priceHistory.length < minTickHistory) {
			ns.print(`Building a history of stock prices (${allStocks[0].priceHistory.length}/${minTickHistory})...`);
			await ns.sleep(sleepInterval);
			continue;
		}
		// Sell shares which are forecasted to underperform (worse than some expected return threshold)
		let sales = 0;
		for (let stk of myStocks) {
			if (stk.absReturn() <= thresholdToSell || stk.bullish() && stk.sharesShort > 0 || stk.bearish() && stk.sharesLong > 0) {
				if (pre4s && stk.ticksHeld < pre4sMinHoldTime) {
					if (!stk.warnedBadPurchase) ns.print(`WARNING: Thinking of selling ${stk.sym} with ER ${formatMoney(ns, stk.absReturn())}, but holding out as it was purchased just ${stk.ticksHeld} ticks ago...`);
					stk.warnedBadPurchase = true; // Hack to ensure we don't spam this warning
				} else {
					sales += doSellAll(ns, stk);
					stk.warnedBadPurchase = false;
				}
			}
		}
		if (sales > 0) continue; // If we sold anything, loop immediately (no need to sleep) and refresh stats immediately before making purchasing decisions.
		let cash = playerStats.money - options['reserve'];
		let liquidity = cash / corpus;
		// If we haven't gone above a certain liquidity threshold, don't attempt to buy more stock
		// Avoids death-by-a-thousand-commissions before we get super-rich, stocks are capped, and this is no longer an issue
		// BUT may mean we miss striking while the iron is hot while waiting to build up more funds.
		if (liquidity > fracB) {
			// If we haven't detected the market cycle (or haven't detected it reliably), assume it might be quite soon and restrict bets to those that can turn a profit in the very-near term.
			const estTick = Math.max(detectedCycleTick, marketCycleLength - (!marketCycleDetected ? 5 : inversionAgreementThreshold <= 8 ? 15 : inversionAgreementThreshold <= 10 ? 30 : marketCycleLength));
			// Buy shares with cash remaining in hand if exceeding some buy threshold. Prioritize targets whose expected return will cover the ask/bit spread the soonest
			for (const stk of allStocks.sort(purchaseOrder)) {
				// Do not purchase a stock if it is not forecasted to recover from the ask/bid spread before the next market cycle and potential probability inversion
				if (stk.blackoutWindow() >= marketCycleLength - estTick) continue;
				if (pre4s && (Math.max(pre4sMinHoldTime, pre4sMinBlackoutWindow) >= marketCycleLength - estTick)) continue;
				// Compute the cash we have to spend (such that spending it all on stock would bring us down to a liquidity of fracH)
				let budget = cash - (fracH * corpus);
				if (budget <= 0) break; // Break if we are out of money (i.e. from prior purchases)
				// Skip if we already own all possible shares in this stock, or if the expected return is below our threshold, or if shorts are disabled and stock is bearish
				if (stk.ownedShares() === stk.maxShares || stk.absReturn() <= thresholdToBuy || (disableShorts && stk.bearish())) continue;
				// If pre-4s, do not purchase any stock whose last inversion was too recent, or whose probability is too close to 0.5
				if (pre4s && (stk.lastInversion < minTickHistory || Math.abs(stk.prob - 0.5) < pre4sBuyThresholdProbability)) continue;
				// Enforce diversification - don't hold more than x% of our portfolio as a single stock (as corpus increases, this naturally stops being a limiter)
				budget = Math.min(budget, (1 - fracH) * corpus * diversification - stk.positionValue());
				let purchasePrice = stk.bullish() ? stk.ask_price : stk.bid_price; // Depends on whether we will be buying a long or short position
				let affordableShares = Math.floor((budget - commission) / purchasePrice);
				let numShares = Math.min(stk.maxShares - stk.ownedShares(), affordableShares);
				if (numShares <= 0) continue;
				// Don't buy fewer shares than can beat the commission before the next stock market cycle (after covering the spread), lest the position reverse before we break even.
				let ticksBeforeCycleEnd = marketCycleLength - estTick - stk.timeToCoverTheSpread();
				if (ticksBeforeCycleEnd < 1) continue; // We're cutting it too close to the market cycle, position might reverse before we break even on commission
				let estEndOfCycleValue = numShares * purchasePrice * ((stk.absReturn() + 1) ** ticksBeforeCycleEnd - 1); // Expected difference in purchase price and value at next market cycle end
				if (estEndOfCycleValue <= 2 * commission)
					ns.print(`Despite attractive ER of ${formatMoney(ns, stk.absReturn())}, ${stk.sym} was not bought. Budget: ${formatMoney(ns, budget)} can only buy ${numShares} shares @ ${formatMoney(ns, purchasePrice)}. ` +
						`Given an estimated ${marketCycleLength - estTick} ticks left in market cycle, less ${stk.timeToCoverTheSpread().toFixed(1)} ticks to cover the spread (${formatPercentage(stk.spread_pct)}), ` +
						`remaining ${ticksBeforeCycleEnd.toFixed(1)} ticks would only generate ${formatMoney(ns, estEndOfCycleValue)}, which is less than 2x commission (${formatMoney(ns, 2 * commission)})`);
				else cash -= doBuy(ns, stk, numShares);
			}
		}
		await ns.sleep(sleepInterval);
	}
}

/**
 *
 * @param {function} func
 * @returns {Object<string, *>}
 */
function getStockInfoDict(ns, func) {
	return Object.fromEntries(ns.stock.getSymbols().map(sym => [sym, func(sym)]));
}

/**
 *
 * @param {NS} ns
 * @returns {Object[]}
 */
function initAllStocks(ns) {
	const dictMaxShares = getStockInfoDict(ns, ns.stock.getMaxShares); // Only need to get this once, it never changes
	return ns.stock.getSymbols().map(s => ({
		sym: s,
		maxShares: dictMaxShares[s], // Value never changes once retrieved
		expectedReturn: function () { // How many holdings are expected to appreciate (or depreciate) in the future
			// To add conservatism to pre-4s estimates, we reduce the probability by 1 standard deviation without crossing the midpoint
			let normalizedProb = (this.prob - 0.5);
			let conservativeProb = normalizedProb < 0 ? Math.min(0, normalizedProb + this.probStdDev) : Math.max(0, normalizedProb - this.probStdDev);
			return this.vol * conservativeProb;
		},
		absReturn: function () {
			return Math.abs(this.expectedReturn());
		}, // Appropriate to use when can just as well buy a short position as a long position
		bullish: function () {
			return this.prob > 0.5;
		},
		bearish: function () {
			return !this.bullish();
		},
		ownedShares: function () {
			return this.sharesLong + this.sharesShort;
		},
		owned: function () {
			return this.ownedShares() > 0;
		},
		positionValueLong: function () {
			return this.sharesLong * this.bid_price;
		},
		positionValueShort: function () {
			return this.sharesShort * (2 * this.boughtPriceShort - this.ask_price);
		}, // Shorts work a bit weird
		positionValue: function () {
			return this.positionValueLong() + this.positionValueShort();
		},
		// How many stock market ticks must occur at the current expected return before we regain the value lost by the spread between buy and sell prices.
		// This can be derived by taking the compound interest formula (future = current * (1 + expected_return) ^ n) and solving for n
		timeToCoverTheSpread: function () {
			return Math.log(this.ask_price / this.bid_price) / Math.log(1 + this.absReturn());
		},
		// We should not buy this stock within this many ticks of a Market cycle, or we risk being forced to sell due to a probability inversion, and losing money due to the spread
		blackoutWindow: function () {
			return Math.ceil(this.timeToCoverTheSpread());
		},
		// Pre-4s properties used for forecasting
		priceHistory: [],
		lastInversion: 0
	}));
}

/**
 *
 * @param {NS} ns
 */
function liquidate(ns) {
	let totalStocks = 0, totalSharesLong = 0, totalSharesShort = 0, totalRevenue = 0;
	const dictPositions = mock ? null : getStockInfoDict(ns, ns.stock.getPosition);
	for (const sym of ns.stock.getSymbols()) {
		const [sharesLong, , sharesShort, avgShortCost] = dictPositions[sym];
		if (sharesLong + sharesShort === 0) continue;
		totalStocks++;
		totalSharesLong += sharesLong;
		totalSharesShort += sharesShort;
		if (sharesLong > 0) totalRevenue += ns.stock.sellStock(sym, sharesLong) * sharesLong - commission;
		if (sharesShort > 0) totalRevenue += (2 * avgShortCost - ns.stock.sellShort(sym, sharesShort)) * sharesShort - commission;
	}
	printBoth(ns, `Sold ${formatNumber(ns, totalSharesLong)} long shares and ${formatNumber(ns, totalSharesShort)} short shares ` +
		`in ${totalStocks} stocks for ${formatMoney(ns, totalRevenue)}`);
}

/**
 *
 * @param {NS} ns
 * @param {Player} playerStats
 * @param {Object<number>} bitnodeMults
 * @param {number} corpus
 * @returns {boolean}
 */
function tryGet4SApi(ns, playerStats, bitnodeMults, corpus) {
	if (ns.stock.has4SDataTIXAPI()) return false; // Only return true if we just bought it
	const cost4sApi = bitnodeMults.FourSigmaMarketDataApiCost * 25e9;
	if (cost4sApi > corpus * 0.9) return false;
	// Liquidate shares if it would allow us to afford 4S API data
	if (playerStats.money < cost4sApi) liquidate(ns);
	if (ns.stock.purchase4SMarketDataTixApi()) {
		printBoth(ns, `Purchased 4SMarketDataTixApi for ${formatMoney(ns, cost4sApi)}`);
		return true;
	} else {
		ns.print(`ERROR attempting to purchase 4SMarketDataTixApi`);
		if (playerStats.bitNodeN !== 5 || !ns.singularity.getOwnedSourceFiles().some(s => s.n === 5)) { // If we do not have access to Bitnode multipliers, assume the cost is double and try again later
			ns.print('INFO: Bitnode mults are not available (SF5) - assuming everything is twice as expensive in the current Bitnode');
			bitnodeMults.FourSigmaMarketDataCost *= 2;
			bitnodeMults.FourSigmaMarketDataApiCost *= 2;
		}
	}
	return false;
}

/**
 *
 * @param {NS} ns
 * @param {Object} stocks
 * @param {Object} myStocks
 * @param {*} hudElement
 */
function doStatusUpdate(ns, stocks, myStocks, hudElement = null) {
	const maxReturnBP = 1e5 * Math.max(...myStocks.map(s => s.absReturn())); // The largest return (in basis points) in our portfolio
	const minReturnBP = 1e5 * Math.min(...myStocks.map(s => s.absReturn())); // The smallest return (in basis points) in our portfolio
	const est_holdings_cost = myStocks.reduce((sum, stk) => sum + (stk.owned() ? commission : 0) +
		stk.sharesLong * stk.boughtPrice + stk.sharesShort * stk.boughtPriceShort, 0);
	const liquidation_value = myStocks.reduce((sum, stk) => sum - (stk.owned() ? commission : 0) + stk.positionValue(), 0);
	ns.print(`Long ${myStocks.filter(s => s.sharesLong > 0).length}, Short ${myStocks.filter(s => s.sharesShort > 0).length} of ${stocks.length} stocks ` +
		(myStocks.length === 0 ? '' : `(ER ${minReturnBP.toFixed(1)}-${maxReturnBP.toFixed(1)} BP) `) +
		`Profit: ${formatMoney(ns, totalProfit)} Holdings: ${formatMoney(ns, liquidation_value)} ` +
		`(Cost: ${formatMoney(ns, est_holdings_cost)}) Net: ${formatMoney(ns, totalProfit + liquidation_value - est_holdings_cost)}`);
	if (hudElement) hudElement.innerText = formatMoney(ns, liquidation_value);
}

/* A sorting function to put stocks in the order we should prioritize investing in them */
const purchaseOrder = (a, b) => (Math.ceil(a.timeToCoverTheSpread()) - Math.ceil(b.timeToCoverTheSpread())) || (b.absReturn() - a.absReturn());

/**
 *
 * @param {NS} ns
 * @param {Player} playerStats
 * @param {Object[]} allStocks
 * @param {Object[]} myStocks
 * @returns {Promise<number>}
 */
async function refresh(ns, playerStats, allStocks, myStocks) {
	const has4s = ns.stock.has4SDataTIXAPI();
	let corpus = playerStats.money;
	const dictAskPrices = getStockInfoDict(ns, ns.stock.getAskPrice);
	const dictBidPrices = getStockInfoDict(ns, ns.stock.getBidPrice);
	const dictVolatilities = !has4s ? null : getStockInfoDict(ns, ns.stock.getVolatility);
	const dictForecasts = !has4s ? null : getStockInfoDict(ns, ns.stock.getForecast);
	const dictPositions = mock ? null : getStockInfoDict(ns, ns.stock.getPosition);
	const ticked = allStocks.some(stk => stk.ask_price !== dictAskPrices[stk.sym]); // If any price has changed since our last update, the stock market has "ticked"
	if (ticked) {
		if (Date.now() - lastTick < expectedTickTime - sleepInterval) {
			if (Date.now() - lastTick < catchUpTickTime - sleepInterval) {
				const changedPrices = allStocks.filter(stk => stk.ask_price !== dictAskPrices[stk.sym]);
				ns.print(`WARNING: Detected a stock market tick after only ${formatTime(ns, Date.now() - lastTick)}, but expected ~${formatTime(ns, expectedTickTime)}. ` +
					(changedPrices.length >= 33 ? '(All stocks updated)' : `The following ${changedPrices.length} stock prices changed: ${changedPrices.map(stk =>
						`${stk.sym} ${formatMoney(ns, stk.ask_price)} -> ${formatMoney(ns, dictAskPrices[stk.sym])}`).join(', ')}`));
			} else ns.print(`INFO: Detected a rapid stock market tick (${formatTime(ns, Date.now() - lastTick)}), likely to make up for lag / offline time.`);
		}
		lastTick = Date.now();
	}

	myStocks.length = 0;
	for (const stk of allStocks) {
		const sym = stk.sym;
		stk.ask_price = dictAskPrices[sym]; // The amount we would pay if we bought the stock (higher than 'price')
		stk.bid_price = dictBidPrices[sym]; // The amount we would receive if we sold the stock (lower than 'price')
		stk.spread = stk.ask_price - stk.bid_price;
		stk.spread_pct = stk.spread / stk.ask_price; // The percentage of value we lose just by buying the stock
		stk.price = (stk.ask_price + stk.bid_price) / 2; // = ns.stock.getPrice(sym);
		stk.vol = has4s ? dictVolatilities[sym] : stk.vol;
		stk.prob = has4s ? dictForecasts[sym] : stk.prob;
		stk.probStdDev = has4s ? 0 : stk.probStdDev; // Standard deviation around the est. probability
		// Update our current portfolio of owned stock
		const [priorLong, priorShort] = [stk.sharesLong, stk.sharesShort];
		stk.position = mock ? null : dictPositions[sym];
		stk.sharesLong = mock ? (stk.sharesLong || 0) : stk.position[0];
		stk.boughtPrice = mock ? (stk.boughtPrice || 0) : stk.position[1];
		stk.sharesShort = mock ? (stk.shares_short || 0) : stk.position[2];
		stk.boughtPriceShort = mock ? (stk.boughtPrice_short || 0) : stk.position[3];
		corpus += stk.positionValue();
		if (stk.owned()) myStocks.push(stk);
		else stk.ticksHeld = 0;
		if (ticked) // Increment ticksHeld, or reset it if we have no position in this stock or reversed our position last tick.
			stk.ticksHeld = !stk.owned() || (priorLong > 0 && stk.sharesLong === 0) || (priorShort > 0 && stk.sharesShort === 0) ? 0 : 1 + (stk.ticksHeld || 0);
	}
	if (ticked) await updateForecast(ns, allStocks, has4s); // Logic below only required on market tick
	return corpus;
}

// Historical probability can be inferred from the number of times the stock was recently observed increasing over the total number of observations
const forecast = history => history.reduce((ups, price, idx) => idx === 0 ? 0 : (history[idx - 1] > price ? ups + 1 : ups), 0) / (history.length - 1);
// An "inversion" can be detected if two probabilities are far enough apart and are within "tolerance" of p1 being equal to 1-p2
const tol2 = inversionDetectionTolerance / 2;
const detectInversion = (p1, p2) => ((p1 >= 0.5 + tol2) && (p2 <= 0.5 - tol2) && p2 <= (1 - p1) + inversionDetectionTolerance)
	/* Reverse Condition: */ || ((p1 <= 0.5 - tol2) && (p2 >= 0.5 + tol2) && p2 >= (1 - p1) - inversionDetectionTolerance);


/**
 *
 * @param {NS} ns
 * @param {Object[]} allStocks
 * @param {boolean} has4s
 * @returns {Promise<void>}
 */
async function updateForecast(ns, allStocks, has4s) {
	const currentHistory = allStocks[0].priceHistory.length;
	const prepSummary = mock || (!has4s && (currentHistory < minTickHistory || allStocks.filter(stk => stk.owned()).length === 0)); // Decide whether to display the market summary table.
	const inversionsDetected = []; // Keep track of individual stocks whose probability has inverted (45% chance of happening each "cycle")
	detectedCycleTick = (detectedCycleTick + 1) % marketCycleLength; // Keep track of stock market cycle (which occurs every 75 ticks)
	for (const stk of allStocks) {
		stk.priceHistory.unshift(stk.price);
		if (stk.priceHistory.length > maxTickHistory) // Limit the rolling window size
			stk.priceHistory.splice(maxTickHistory, 1);
		// Volatility is easy - the largest observed % movement in a single tick
		if (!has4s) stk.vol = stk.priceHistory.reduce((max, price, idx) => Math.max(max, idx === 0 ? 0 : Math.abs(stk.priceHistory[idx - 1] - price) / price), 0);
		// We want stocks that have the best expected return, averaged over a long window for greater precision, but the game will occasionally invert probabilities
		// (45% chance every 75 updates), so we also compute a near-term forecast window to allow for early-detection of inversions, so we can ditch our position.
		stk.nearTermForecast = forecast(stk.priceHistory.slice(0, nearTermForecastWindowLength));
		let preNearTermWindowProb = forecast(stk.priceHistory.slice(nearTermForecastWindowLength)); // Used to detect the probability before the potential inversion event.
		// Detect whether it appears as though the probability of this stock has recently undergone an inversion (i.e. prob => 1 - prob)
		stk.possibleInversionDetected = has4s ? detectInversion(stk.prob, stk.lastTickProbability || stk.prob) : detectInversion(preNearTermWindowProb, stk.nearTermForecast);
		stk.lastTickProbability = stk.prob;
		if (stk.possibleInversionDetected) inversionsDetected.push(stk);
	}
	// Detect whether our auto-detected "stock market cycle" timing should be adjusted based on the number of potential inversions observed
	let summary = '';
	if (inversionsDetected.length > 0) {
		summary += `${inversionsDetected.length} Stocks appear to be reversing their outlook: ${inversionsDetected.map(s => s.sym).join(', ')} (threshold: ${inversionAgreementThreshold})\n`;
		if (inversionsDetected.length >= inversionAgreementThreshold && (has4s || currentHistory >= minTickHistory)) { // We believe we have detected the stock market cycle!
			const newPredictedCycleTick = has4s ? 0 : nearTermForecastWindowLength; // By the time we've detected it, we're this many ticks past the cycle start
			if (detectedCycleTick !== newPredictedCycleTick) {
				ns.print(`Threshold for changing predicted market cycle met (${inversionsDetected.length} >= ${inversionAgreementThreshold}). ` +
					`Changing current market tick from ${detectedCycleTick} to ${newPredictedCycleTick}.`);
			}
			marketCycleDetected = true;
			detectedCycleTick = newPredictedCycleTick;
			// Don't adjust this in the future unless we see another day with as much or even more agreement (capped at 14, it seems sometimes our cycles get out of sync with
			// actual cycles, and we need to reset our clock even after previously determining the cycle with great certainty.)
			inversionAgreementThreshold = Math.max(14, inversionsDetected.length);
		}
	}
	// Act on any inversions (if trusted), compute the probability, and prepare the stock summary
	for (const stk of allStocks) {
		// Don't "trust" (act on) a detected inversion unless it's near the time when we're capable of detecting market cycle start. Avoids most false-positives.
		if (stk.possibleInversionDetected && (has4s && detectedCycleTick === 0 ||
			(!has4s && (detectedCycleTick > nearTermForecastWindowLength / 2 - 1) &&
				(detectedCycleTick <= nearTermForecastWindowLength + inversionLagTolerance)))) {
			stk.lastInversion = detectedCycleTick; // If we "trust" a probability inversion has occurred, probability will be calculated based on only history since the last inversion.
		} else stk.lastInversion++;
		// Only take the stock history since after the last inversion to compute the probability of the stock.
		const probWindowLength = Math.min(longTermForecastWindowLength, stk.lastInversion);
		stk.longTermForecast = forecast(stk.priceHistory.slice(0, probWindowLength));
		if (!has4s) {
			stk.prob = stk.longTermForecast;
			stk.probStdDev = Math.sqrt((stk.prob * (1 - stk.prob)) / probWindowLength);
		}
		const signalStrength = 1 + (stk.bullish() ? (stk.nearTermForecast > stk.prob ? 1 : 0) + (stk.prob > 0.8 ? 1 : 0) : (stk.nearTermForecast < stk.prob ? 1 : 0) + (stk.prob < 0.2 ? 1 : 0));
		if (prepSummary) { // Example: AERO  ++   Prob: 54% (t51: 54%, t10: 67%) tLast⇄:190 Vol:0.640% ER: 2.778BP Spread:1.784% ttProfit: 65 Pos: 14.7M long  (held 189 ticks)
			stk.debugLog = `${stk.sym.padEnd(5, ' ')} ${(stk.bullish() ? '+' : '-').repeat(signalStrength).padEnd(3)} ` +
				`Prob:${(stk.prob * 100).toFixed(0).padStart(3)}% (t${probWindowLength.toFixed(0).padStart(2)}:${(stk.longTermForecast * 100).toFixed(0).padStart(3)}%, ` +
				`t${Math.min(stk.priceHistory.length, nearTermForecastWindowLength).toFixed(0).padStart(2)}:${(stk.nearTermForecast * 100).toFixed(0).padStart(3)}%) ` +
				`tLast⇄:${(stk.lastInversion + 1).toFixed(0).padStart(3)} Vol:${formatPercentage(stk.vol)} ER:${formatMoney(ns, stk.expectedReturn()).padStart(8)} ` +
				`Spread:${formatPercentage(stk.spread_pct)} ttProfit:${stk.blackoutWindow().toFixed(0).padStart(3)}`;
			if (stk.owned()) stk.debugLog += ` Pos: ${formatMoney(ns, stk.ownedShares())} (${stk.ownedShares() === stk.maxShares ? 'max' :
				formatPercentage(stk.ownedShares() / stk.maxShares)}) ${stk.sharesLong > 0 ? 'long ' : 'short'} (held ${stk.ticksHeld} ticks)`;
			if (stk.possibleInversionDetected) stk.debugLog += ' ⇄⇄⇄';
		}
	}
	// Print a summary of stocks as of this most recent tick (if enabled)
	if (prepSummary) {
		summary += `Market day ${detectedCycleTick + 1}${marketCycleDetected ? '' : '?'} of ${marketCycleLength} (${marketCycleDetected ? (100 * inversionAgreementThreshold / 19).toPrecision(2) : '0'}% certain) ` +
			`Current Stock Summary and Pre-4S Forecasts (by best payoff-time):\n` + allStocks.sort(purchaseOrder).map(s => s.debugLog).join('\n');
		ns.print(summary);
	}
	// Write out a file of stock information so that other scripts can make use of this (e.g. hacks and grows can manipulate the stock market)
	const long = [];
	const short = [];
	allStocks.forEach(stk => {
		const symbol = symbolToServer(stk.sym);
		if (symbol) {
			if (stk.sharesLong > 0) long.push(symbol);
			if (stk.sharesShort > 0) short.push(symbol);
		}
	});
	await modifyFile(ns, portNumber, {long: long, short: short});
}

/**
 * Automatically buys either a short or long position depending on the outlook of the stock
 *
 * @param {NS} ns
 * @param {Object} stk
 * @param {amount} sharesBought
 * @returns {number}
 */
function doBuy(ns, stk, sharesBought) {
	// We include -2*commission in the "holdings value" of our stock, but if we make repeated purchases of the same stock, we have to track
	// the additional commission somewhere. So only subtract it from our running profit if this isn't our first purchase of this symbol
	if (stk.owned()) totalProfit -= commission;
	let long = stk.bullish();
	let expectedPrice = long ? stk.ask_price : stk.bid_price; // Depends on whether we will be buying a long or short position
	let price;
	try {
		price = mock ? expectedPrice : long ? ns.stock.buyStock(stk.sym, sharesBought) : ns.stock.buyShort(stk.sym, sharesBought);
	} catch (err) {
		if (long) throw err;
		printBoth(ns, `WARNING: Failed to short ${stk.sym} (Shorts not available?). Disabling shorts...`);
		disableShorts = true;
		return 0;
	}

	ns.print(`INFO: ${long ? 'Bought ' : 'Shorted'} ${formatNumber(ns, sharesBought).padStart(5)}${stk.maxShares === sharesBought + stk.ownedShares() ? ' (max shares)' : ''} ` +
		`${stk.sym.padEnd(5)} @ ${formatMoney(ns, price).padStart(9)} for ${formatMoney(ns, sharesBought * price).padStart(9)} (Spread: ${formatPercentage(stk.spread_pct)} ` +
		`ER:${formatMoney(ns, stk.expectedReturn()).padStart(8)}) Ticks to Profit: ${stk.timeToCoverTheSpread().toFixed(2)}`);
	// The rest of this work is for troubleshooting / mock-mode purposes
	if (price === 0) {
		printBoth(ns, `ERROR: Failed to ${long ? 'buy' : 'short'} ${stk.sym} @ ${formatMoney(ns, expectedPrice)} - 0 was returned`);
		return 0;
	} else if (price !== expectedPrice) {
		printBoth(ns, `WARNING: ${long ? 'Bought' : 'Shorted'} ${stk.sym} @ ${formatMoney(ns, price)} but expected ${formatMoney(ns, expectedPrice)} (spread: ${formatMoney(ns, stk.spread)})`);
		price = expectedPrice; // Known Bitburner bug for now, short returns "price" instead of "bit_price". Correct this so running profit calculations are correct.
	}
	if (mock && long) stk.boughtPrice = (stk.boughtPrice * stk.sharesLong + price * sharesBought) / (stk.sharesLong + sharesBought);
	if (mock && !long) stk.boughtPriceShort = (stk.boughtPriceShort * stk.sharesShort + price * sharesBought) / (stk.sharesShort + sharesBought);
	if (long) stk.sharesLong += sharesBought; else stk.sharesShort += sharesBought; // Maintained for mock mode, otherwise, redundant (overwritten at next refresh)
	return sharesBought * price + commission; // Return the amount spent on the transaction, so it can be subtracted from our cash on hand
}

/**
 * Sell our current position in this stock
 *
 * @param {NS} ns
 * @param {Object} stk
 * @returns {number}
 */
function doSellAll(ns, stk) {
	let long = stk.sharesLong > 0;
	if (long && stk.sharesShort > 0) // Detect any issues here - we should always sell one before buying the other.
		printBoth(ns, `ERROR: Somehow ended up both ${stk.sharesShort} short and ${stk.sharesLong} long on ${stk.sym}`);
	let expectedPrice = long ? stk.bid_price : stk.ask_price; // Depends on whether we will be selling a long or short position
	let sharesSold = long ? stk.sharesLong : stk.sharesShort;
	let price = mock ? expectedPrice : long ? ns.stock.sellStock(stk.sym, sharesSold) : ns.stock.sellShort(stk.sym, sharesSold);
	const profit = (long ? stk.sharesLong * (price - stk.boughtPrice) : stk.sharesShort * (stk.boughtPriceShort - price)) - 2 * commission;
	ns.print(`${profit > 0 ? 'SUCCESS' : 'WARNING'}: Sold all ${formatMoney(ns, sharesSold).padStart(5)} ${stk.sym.padEnd(5)} ${long ? ' long' : 'short'} positions ` +
		`@ ${formatMoney(ns, price).padStart(9)} for a ` + (profit > 0 ? `PROFIT of ${formatMoney(ns, profit).padStart(9)}` : ` LOSS of ${formatMoney(ns, -profit).padStart(9)}`) + ` after ${stk.ticksHeld} ticks`);
	if (price === 0) {
		printBoth(ns, `ERROR: Failed to sell ${sharesSold} ${stk.sym} ${long ? 'shares' : 'shorts'} @ ${formatMoney(ns, expectedPrice)} - 0 was returned`);
		return 0;
	} else if (price !== expectedPrice) {
		ns.print(`WARNING: Sold ${stk.sym} ${long ? 'shares' : 'shorts'} @ ${formatMoney(ns, price)} but expected ${formatMoney(ns, expectedPrice)} (spread: ${formatMoney(ns, stk.spread)})`);
		price = expectedPrice; // Known Bitburner bug for now, sellSort returns "price" instead of "ask_price". Correct this so running profit calculations are correct.
	}
	if (long) stk.sharesLong -= sharesSold;
	else stk.sharesShort -= sharesSold; // Maintained for mock mode, otherwise, redundant (overwritten at next refresh)
	totalProfit += profit;
	return price * sharesSold - commission; // Return the amount of money received from the transaction
}

/**
 *
 * @returns {*}
 */
function initializeHud() {
	const d = eval('document');
	let htmlDisplay = d.getElementById('stock-display-1');
	if (htmlDisplay !== null) return htmlDisplay;
	// Get the custom display elements in HUD.
	let customElements = d.getElementById('overview-extra-hook-0').parentElement.parentElement;
	// Make a clone of the hook for extra hud elements, and move it up under money
	let stockValueTracker = customElements.cloneNode(true);
	// Remove any nested elements created by stats.js
	stockValueTracker.querySelectorAll('p > p').forEach(e => e.parentElement.removeChild(e));
	// Change ids since duplicate ids are invalid
	stockValueTracker.querySelectorAll('p').forEach((e, i) => e.id = `stock-display-${i}`);
	// Get out output element
	htmlDisplay = stockValueTracker.querySelector('#stock-display-1');
	// Display label and default value
	stockValueTracker.querySelectorAll('p')[0].innerText = 'Stock';
	htmlDisplay.innerText = '$0.000 ';
	// Insert our element right after Money
	customElements.parentElement.insertBefore(stockValueTracker, customElements.parentElement.childNodes[2]);
	return htmlDisplay;
}