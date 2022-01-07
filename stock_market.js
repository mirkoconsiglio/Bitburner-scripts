// Requires access to the TIX API and the 4S Mkt Data API
let fracL = 0.1; // Fraction of assets to keep as cash in hand
let fracH = 0.2;
let commission = 100000; // Buy or sell commission

function refresh(ns, stocks, myStocks) {
	let corpus = ns.getServerMoneyAvailable("home");
	myStocks.length = 0;
	for (let stock of stocks) {
		let sym = stock.sym;
		stock.price = ns.stock.getPrice(sym);
		[stock.shares, stock.buyPrice] = ns.stock.getPosition(sym);
		stock.vol = ns.stock.getVolatility(sym);
		stock.prob = 2 * (ns.stock.getForecast(sym) - 0.5);
		stock.expRet = stock.vol * stock.prob / 2;
		corpus += stock.price * stock.shares;
		if (stock.shares > 0) myStocks.push(stock);
	}
	stocks.sort((a, b) => b.expRet - a.expRet);
	return corpus;
}

function buy(ns, stock, numShares) {
	let price = ns.stock.buy(stock.sym, numShares);
	let totalPrice = price * numShares
	if (price) ns.print(`Bought ${numShares} shares of ${stock.sym} for ${ns.nFormat(totalPrice, "0.000a")}`);
}

function sell(ns, stock, numShares) {
	let price = ns.stock.sell(stock.sym, numShares);
	let profit = numShares * (stock.price - stock.buyPrice) - 2 * commission;
	if (price) ns.print(`Sold ${numShares} shares of ${stock.sym} for a profit of ${ns.nFormat(profit, "0.000a")}`);
}

export async function main(ns) {
	//Initialise
	ns.disableLog("ALL");
	let stocks = [];
	let myStocks = [];
	let corpus = 0;
	
	for (let sym of ns.stock.getSymbols()) {
		stocks.push({sym: sym});
	}
	
	while (true) {
		corpus = refresh(ns, stocks, myStocks);
		// Sell underperforming shares
		for (let myStock of myStocks) {
			if (stocks[0].expRet > myStock.expRet) {
				sell(ns, myStock, myStock.shares);
				corpus -= commission;
			}
		}
		// Sell shares if not enough cash in hand
		for (let myStock of myStocks) {
			if (ns.getServerMoneyAvailable("home") < fracL * corpus) {
				let cashNeeded = corpus * fracH - ns.getServerMoneyAvailable("home") + commission;
				let numShares = Math.ceil(cashNeeded / myStock.price);
				sell(ns, myStock, numShares);
				corpus -= commission;
			}
		}
		// Buy shares with cash remaining in hand
		let cashToSpend = ns.getServerMoneyAvailable("home") - (fracH * corpus);
		let numShares = Math.floor((cashToSpend - commission) / stocks[0].price);
		if (numShares > ns.stock.getMaxShares(stocks[0].sym)) numShares = ns.stock.getMaxShares(stocks[0].sym);
		if ((numShares * stocks[0].expRet * stocks[0].price) > commission) buy(ns, stocks[0], numShares);
		await ns.sleep(10000);
	}
}