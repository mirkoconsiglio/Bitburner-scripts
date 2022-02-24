// Requires WSE and TIX API
// Constants
// noinspection DuplicatedCode

const commission = 1e5;
const FourSigmaMarketDataBasePrice = 25e9;
// Parameters
const historyLength = 100; // Maximum cycles to predict from
const bidThreshold = 1e4;
const askThreshold = 50;
const symbol = 'JGN'; // Target Joesguns
const askHistory = [];
const bidHistory = [];
let forecast = {ask: 0, bid: 0};
// TODO: fix script when not being able to short
export async function main(ns) {
	const player = ns.getPlayer();
	if (!player.hasWseAccount) throw new Error(`You need WSE account to trade stocks`);
	if (!player.hasTixApiAccess) throw new Error(`This script requires access to the TIX API`);
	switch (player.bitNodeN === 8 ? 3 : (ns.getOwnedSourceFiles().find(s => s.n === 8) ?? {lvl: 1}).lvl) {
		case 1:
			await stockMarket1(ns);
			break;
		case 2:
			await stockMarket2(ns);
			break;
		case 3:
			await stockMarket3(ns);
			break;
		default:
			throw new Error(`How did we get here?`);
	}
}
// Basic
async function stockMarket1(ns) {
	let lastAsk = ns.stock.getAskPrice(symbol);
	let lastBid = ns.stock.getBidPrice(symbol);
	// Autopilot
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		// Data
		const player = ns.getPlayer();
		const position = ns.stock.getPosition(symbol);
		const shares = position[0];
		const ask = ns.stock.getAskPrice(symbol);
		const bid = ns.stock.getBidPrice(symbol);
		// Buy 4S Data TIX API if we can
		if (!player.has4SDataTixApi) {
			const fourSigmaPrice = FourSigmaMarketDataBasePrice * ns.getBitNodeMultipliers().FourSigmaMarketDataApiCost;
			if (player.money >= fourSigmaPrice) ns.stock.purchase4SMarketDataTixApi();
		}
		// Predict forecast
		if (!player.has4SDataTixApi) { // If we don't have 4S Data TIX API yet
			if (lastAsk !== ask || lastBid !== bid) forecast = addHistory(ask, bid);
			lastAsk = ask;
			lastBid = bid;
			// Wait until history is full
			if (askHistory.length !== historyLength && bidHistory.length !== historyLength) {
				ns.print(`History ${askHistory.length}/${historyLength}`);
				await ns.sleep(1000);
				continue; // Build more history before we do anything
			}
		} else { // If we have 4S Data TIX API
			const prob = ns.stock.getForecast(symbol);
			forecast.ask = prob;
			forecast.bid = prob;
		}
		// Bet
		if (shares > 0) { // Long
			ns.print(`Currently long`);
			if (bid >= bidThreshold) {
				ns.print(`Bid Threshold met`);
				// effectHack = true;
				// effectGrow = false;
				if (forecast.bid < 0.5) { // Going down
					ns.print(`Forecast going down time to sell`);
					// Sell
					ns.stock.sell(symbol, shares);
				}
			} else {
				// Keep growing
				// effectHack = false;
				// effectGrow = true;
			}
		} else { // No position
			// Check which price is closer
			const a = Math.abs(ask - askThreshold);
			const b = Math.abs(bid - bidThreshold);
			if (b > a || bid > bidThreshold) { // Closer to ask
				ns.print(`Closer to ask`);
				// effectHack = true;
				// effectGrow = false;
			} else if (a > b || ask < askThreshold) { // Closer to bid
				ns.print(`Closer to bid`);
				// Long
				buy(ns, 'l', bid, ask);
				// effectHack = false;
				// effectGrow = true;
			} else {
				ns.print(`Equally close`);
				// Long
				buy(ns, 'l', bid, ask);
				// effectHack = false;
				// effectGrow = true;
			}
		}
		await ns.sleep(1000);
	}
}
// Can short
async function stockMarket2(ns) {
	let lastAsk = ns.stock.getAskPrice(symbol);
	let lastBid = ns.stock.getBidPrice(symbol);
	// Autopilot
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		// Data
		const player = ns.getPlayer();
		const position = ns.stock.getPosition(symbol);
		const shares = position[0];
		const sharesShort = position[2];
		const ask = ns.stock.getAskPrice(symbol);
		const bid = ns.stock.getBidPrice(symbol);
		// Buy 4S Data TIX API if we can
		if (!player.has4SDataTixApi) {
			const fourSigmaPrice = FourSigmaMarketDataBasePrice * ns.getBitNodeMultipliers().FourSigmaMarketDataApiCost;
			if (player.money >= fourSigmaPrice) ns.stock.purchase4SMarketDataTixApi();
		}
		// Predict forecast
		if (!player.has4SDataTixApi) { // If we don't have 4S Data TIX API yet
			if (lastAsk !== ask || lastBid !== bid) forecast = addHistory(ask, bid);
			lastAsk = ask;
			lastBid = bid;
			// Wait until history is full
			if (askHistory.length !== historyLength && bidHistory.length !== historyLength) {
				ns.print(`History ${askHistory.length}/${historyLength}`);
				await ns.sleep(1000);
				continue; // Build more history before we do anything
			}
		} else { // If we have 4S Data TIX API
			const prob = ns.stock.getForecast(symbol);
			forecast.ask = prob;
			forecast.bid = prob;
		}
		// Bet
		if (shares > 0) { // Long
			ns.print(`Currently long`);
			if (bid >= bidThreshold) {
				ns.print(`Bid Threshold met`);
				// effectHack = true;
				// effectGrow = false;
				if (forecast.bid < 0.5) { // Going down
					ns.print(`Forecast going down time to swap position`);
					// Sell
					ns.stock.sell(symbol, shares);
					// Short
					buy(ns, 's', bid, ask);
				}
			} else {
				// Keep growing
				// effectHack = false;
				// effectGrow = true;
			}
		} else if (sharesShort > 0) { // Short
			ns.print(`Currently short`);
			if (ask <= askThreshold) {
				ns.print(`Ask Threshold met`);
				// effectHack = false;
				// effectGrow = true;
				if (forecast.ask > 0.5) { // Going up
					ns.print(`Forecast going up time to swap position`);
					// Sell
					ns.stock.sellShort(symbol, sharesShort);
					// Buy
					buy(ns, 'l', bid, ask);
				}
			} else {
				// keep hacking
				// effectHack = true;
				// effectGrow = false;
			}
		} else { // No position
			// Check which price is closer
			const a = Math.abs(ask - askThreshold);
			const b = Math.abs(bid - bidThreshold);
			if (b > a || bid > bidThreshold) { // Closer to ask
				ns.print(`Closer to ask`);
				// Short
				buy(ns, 's', bid, ask);
				// effectHack = true;
				// effectGrow = false;
			} else if (a > b || ask < askThreshold) { // Closer to bid
				ns.print(`Closer to bid`);
				// Long
				buy(ns, 'l', bid, ask);
				// effectHack = false;
				// effectGrow = true;
			} else {
				ns.print(`Equally close`);
				// Long
				buy(ns, 'l', bid, ask);
				// effectHack = false;
				// effectGrow = true;
			}
		}
		await ns.sleep(1000);
	}
}

// TODO: Use limit/stop orders
// Can place limit/stop orders
async function stockMarket3(ns) {
	let lastAsk = ns.stock.getAskPrice(symbol);
	let lastBid = ns.stock.getBidPrice(symbol);
	// Autopilot
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		// Data
		const player = ns.getPlayer();
		const position = ns.stock.getPosition(symbol);
		const shares = position[0];
		const sharesShort = position[2];
		const ask = ns.stock.getAskPrice(symbol);
		const bid = ns.stock.getBidPrice(symbol);
		// Buy 4S Data TIX API if we can
		if (!player.has4SDataTixApi) {
			const fourSigmaPrice = FourSigmaMarketDataBasePrice * ns.getBitNodeMultipliers().FourSigmaMarketDataApiCost;
			if (player.money >= fourSigmaPrice) ns.stock.purchase4SMarketDataTixApi();
		}
		// Predict forecast
		if (!player.has4SDataTixApi) { // If we don't have 4S Data TIX API yet
			if (lastAsk !== ask || lastBid !== bid) forecast = addHistory(ask, bid);
			lastAsk = ask;
			lastBid = bid;
			// Wait until history is full
			if (askHistory.length !== historyLength && bidHistory.length !== historyLength) {
				ns.print(`History ${askHistory.length}/${historyLength}`);
				await ns.sleep(1000);
				continue; // Build more history before we do anything
			}
		} else { // If we have 4S Data TIX API
			const prob = ns.stock.getForecast(symbol);
			forecast.ask = prob;
			forecast.bid = prob;
		}
		// Bet
		if (shares > 0) { // Long
			ns.print(`Currently long`);
			if (bid >= bidThreshold) {
				ns.print(`Bid Threshold met`);
				// effectHack = true;
				// effectGrow = false;
				if (forecast.bid < 0.5) { // Going down
					ns.print(`Forecast going down time to swap position`);
					// Sell
					ns.stock.sell(symbol, shares);
					// Short
					buy(ns, 's', bid, ask);
				}
			} else {
				// Keep growing
				// effectHack = false;
				// effectGrow = true;
			}
		} else if (sharesShort > 0) { // Short
			ns.print(`Currently short`);
			if (ask <= askThreshold) {
				ns.print(`Ask Threshold met`);
				// effectHack = false;
				// effectGrow = true;
				if (forecast.ask > 0.5) { // Going up
					ns.print(`Forecast going up time to swap position`);
					// Sell
					ns.stock.sellShort(symbol, sharesShort);
					// Buy
					buy(ns, 'l', bid, ask);
				}
			} else {
				// keep hacking
				// effectHack = true;
				// effectGrow = false;
			}
		} else { // No position
			// Check which price is closer
			const a = Math.abs(ask - askThreshold);
			const b = Math.abs(bid - bidThreshold);
			if (b > a || bid > bidThreshold) { // Closer to ask
				ns.print(`Closer to ask`);
				// Short
				buy(ns, 's', bid, ask);
				// effectHack = true;
				// effectGrow = false;
			} else if (a > b || ask < askThreshold) { // Closer to bid
				ns.print(`Closer to bid`);
				// Long
				buy(ns, 'l', bid, ask);
				// effectHack = false;
				// effectGrow = true;
			} else {
				ns.print(`Equally close`);
				// Long
				buy(ns, 'l', bid, ask);
				// effectHack = false;
				// effectGrow = true;
			}
		}
		await ns.sleep(1000);
	}
}
// Buy or short shares
function buy(ns, type, bid, ask) {
	const player = ns.getPlayer();
	const budget = player.money / 2;
	const long = type === 'l';
	const affordableShares = Math.floor((budget - commission) / (long ? ask : bid));
	const sharesToGet = Math.min(ns.stock.getMaxShares(symbol), affordableShares);
	if (long) {
		const price = ns.stock.buy(symbol, sharesToGet);
		ns.print(`Buying ${ns.nFormat(price, '$0.000a')}/${ns.nFormat(sharesToGet, '0.000a')} shares`);
	} else {
		const price = ns.stock.short(symbol, sharesToGet);
		ns.print(`Shorting ${ns.nFormat(price, '$0.000a')}/${ns.nFormat(sharesToGet, '0.000a')} shares`);
	}
}
// Add forecast history
function addHistory(ask, bid) {
	const askLength = askHistory.unshift(ask);
	if (askLength > historyLength) askHistory.pop();
	const bidLength = bidHistory.unshift(bid);
	if (bidLength > historyLength) bidHistory.pop();
	return {
		ask: getForecast(askHistory),
		bid: getForecast(bidHistory)
	};
}
// Get predicted forecast
function getForecast(history) {
	return history.reduce((ups, price, idx) => idx === 0 ? 0 : (history[idx - 1] > price ? ups + 1 : ups), 0) / (history.length - 1);
}