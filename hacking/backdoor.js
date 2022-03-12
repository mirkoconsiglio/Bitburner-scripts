import {hackServer, routeFinder} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const server = ns.args[0];
	const route = routeFinder(ns, server);
	if (route && hackServer(ns, server)) {
		for (let serv of route) {
			ns.connect(serv);
		}
		await ns.installBackdoor();
		for (let serv of route.reverse()) {
			ns.connect(serv);
		}
	}
}

// noinspection JSUnusedGlobalSymbols
/**
 *
 * @param {*} data
 * @returns {string[]}
 */
export function autocomplete(data) {
	// noinspection JSUnresolvedVariable
	return data.servers;
}