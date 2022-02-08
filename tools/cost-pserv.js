export async function main(ns) {
	const cost = ns.getPurchasedServerCost(Math.pow(2, ns.args[0]));
	const maxServers = Math.floor(ns.getBitNodeMultipliers().PurchasedServerLimit * 25);
	const costMax = cost * maxServers;
	ns.tprint(`1 Server: ${ns.nFormat(cost, '$0.000a')}, ${maxServers} servers: ${ns.nFormat(costMax, '$0.000a')}`);
}