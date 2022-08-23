import {routeFinder} from '/utils.js';

export function autocomplete(data) {
	return data.servers;
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const server = ns.args[0];
	const route = routeFinder(ns, server);
	if (route) for (const serv of route) ns.singularity.connect(serv);
}