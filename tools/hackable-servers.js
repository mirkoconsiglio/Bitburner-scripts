import {getAccessibleServers, getOptimalHackable, targetCost} from '/utils.js';

const argsSchema = [
	['cores', 1],
	['verbose', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, args) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	const servers = getAccessibleServers(ns);
	const hackable = getOptimalHackable(ns, servers);
	for (let [i, server] of hackable.entries()) {
		const growth = ns.getServerGrowth(server);
		const money = ns.nFormat(ns.getServerMaxMoney(server), '0.000a');
		const minSec = ns.getServerMinSecurityLevel(server);
		const cost = targetCost(ns, server, options.cores);
		let string = `${i + 1}: Server: ${server}`;
		if (options.verbose) string += `, Maximum Money: ${money}, Growth: ${growth}, Min Security: ${minSec}`;
		for (let [j, c] of cost.entries()) string += `, Cost ${j + 1}: ${ns.nFormat(c, '0.000a')}`;
		ns.tprintf(string);
	}
}