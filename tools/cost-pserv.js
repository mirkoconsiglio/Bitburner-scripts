export async function main(ns) {
	let cost = ns.getPurchasedServerCost(Math.pow(2, ns.args[0]));
	ns.tprint(ns.nFormat(cost, '$0.000a') + ' / ' + ns.nFormat(cost * 25, '$0.000a'));
}