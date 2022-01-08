export async function main(ns) {
	let power = ns.args[0];
	let cost = ns.getPurchasedServerCost(Math.pow(2, power));
	ns.tprint(ns.nFormat(cost, '0.000a') + ' / ' + ns.nFormat(cost * 25, '0.000a'));
}