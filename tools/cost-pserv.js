import {formatMoney} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const cost = ns.getPurchasedServerCost(Math.pow(2, ns.args[0]));
	const maxServers = Math.floor(ns.getBitNodeMultipliers().PurchasedServerLimit * 25);
	const costMax = cost * maxServers;
	ns.tprint(`1 Server: ${formatMoney(ns, cost)}, ${maxServers} servers: ${formatMoney(ns, costMax)}`);
}