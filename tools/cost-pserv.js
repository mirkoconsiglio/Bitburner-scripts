export async function main(ns) {
	const cost = ns.getPurchasedServerCost(Math.pow(2, ns.args[0]));
	const cost25 = cost * 25;
	ns.tprint(`1 Server: ${ns.nFormat(cost, '$0.000a')}, 25 servers: ${ns.nFormat(cost25, '$0.000a')}`);
}