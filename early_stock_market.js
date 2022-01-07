const commission = 100000;
const samplingLength = 30;

function predictState(samples) {
	const limits = [null, null, null, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 12, 12, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18, 19, 19, 20];
	let inc = 0;
	for (let i = 0; i < samples.length; ++i) {
		const total = i + 1;
		const idx = samples.length - total;
		if (samples[idx] > 1) {
			inc++;
		}
		const limit = limits[i];
		if (limit === null) {
			continue;
		}
		if (inc >= limit) {
			return 1;
		}
		if ((total - inc) >= limit) {
			return -1;
		}
	}
	return 0;
}

function posNegDiff(samples) {
	const pos = samples.reduce((acc, curr) => acc + (curr > 1. ? 1 : 0), 0);
	return Math.abs(samples.length - 2 * pos);
}

function posNegRatio(samples) {
	const pos = samples.reduce((acc, curr) => acc + (curr > 1. ? 1 : 0), 0);
	return Math.round(100 * (2 * pos / samples.length - 1));
}

export async function main(ns) {
	ns.disableLog("ALL");
	let symLastPrice = {};
	let symChanges = {};
	for (const sym of ns.stock.getSymbols()) {
		symLastPrice[sym] = ns.stock.getPrice(sym);
		symChanges[sym] = []
	}
	
	while (true) {
		await ns.sleep(2000);
		
		if (symLastPrice['FSIG'] === ns.stock.getPrice('FSIG')) {
			continue;
		}
		
		for (const sym of ns.stock.getSymbols()) {
			const current = ns.stock.getPrice(sym);
			symChanges[sym].push(current / symLastPrice[sym]);
			symLastPrice[sym] = current;
			if (symChanges[sym].length > samplingLength) {
				symChanges[sym] = symChanges[sym].slice(symChanges[sym].length - samplingLength);
			}
		}
		
		const prioritizedSymbols = [...ns.stock.getSymbols()];
		prioritizedSymbols.sort((a, b) => posNegDiff(symChanges[b]) - posNegDiff(symChanges[a]));
		
		for (const sym of prioritizedSymbols) {
			const positions = ns.stock.getPosition(sym);
			const longShares = positions[0];
			const longPrice = positions[1];
			const shortShares = positions[2];
			const shortPrice = positions[3];
			const state = predictState(symChanges[sym]);
			const ratio = posNegRatio(symChanges[sym]);
			const bidPrice = ns.stock.getBidPrice(sym);
			const askPrice = ns.stock.getAskPrice(sym);
			if (longShares <= 0 && shortShares <= 0 && ns.stock.getPrice(sym) < 30000) {
				continue;
			}
			
			if (longShares > 0) {
				const cost = longShares * longPrice;
				const profit = longShares * (bidPrice - longPrice) - 2 * commission;
				if (state < 0) {
					const sellPrice = ns.stock.sell(sym, longShares);
					if (sellPrice > 0) {
						ns.print(`SOLD (long) ${sym}. Profit: ${ns.nFormat(profit, "0.000a")}`);
					}
				} else {
					ns.print(`${sym} (${ratio}): ${ns.nFormat(profit + cost, "0.000a")} / ${ns.nFormat(profit, "0.000a")} (${(profit / cost * 100).toFixed(2)}%)`);
				}
			} else if (shortShares > 0) {
				const cost = shortShares * shortPrice;
				const profit = shortShares * (shortPrice - askPrice) - 2 * commission;
				if (state > 0) {
					const sellPrice = ns.stock.sellShort(sym, shortShares);
					if (sellPrice > 0) {
						ns.print(`SOLD (short) ${sym}. Profit: ${ns.nFormat(profit, "0.000a")}`);
					}
				} else {
					ns.print(`${sym} (${ratio}): ${ns.nFormat(profit + cost, "0.000a")} / ${ns.nFormat(profit, "0.000a")} (${(profit / cost * 100).toFixed(2)}%)`);
				}
			} else {
				const money = ns.getServerMoneyAvailable("home");
				if (state > 0) {
					const sharesToBuy = Math.min(10000, ns.stock.getMaxShares(sym), Math.floor((money - commission) / askPrice));
					if (ns.stock.buy(sym, sharesToBuy) > 0) {
						ns.print(`BOUGHT (long) ${sym}.`);
					}
				}
				// else if (state < 0 ) {
				//   const sharesToBuy = Math.min(10000, ns.stock.getMaxShares(sym), Math.floor((money - commission) / bidPrice));
				//   if (ns.stock.short(sym, sharesToBuy) > 0) {
				//     ns.print(`BOUGHT (short) ${sym}.`);
				//   }
				// }
			}
		}
	}
}