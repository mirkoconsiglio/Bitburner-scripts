import {copyScriptsToAll, findPlaceToRun, getAccessibleServers, getFreeRams, getScripts} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	await copyScriptsToAll(ns);
	const threads = Number.MAX_SAFE_INTEGER;
	const scripts = getScripts();
	let i = 0;
	// noinspection InfiniteLoopJS
	while (true) {
		const servers = getAccessibleServers(ns);
		const freeRams = getFreeRams(ns, servers);
		findPlaceToRun(ns, scripts.share, threads, freeRams, i);
		i++;
		await ns.sleep(1000);
	}
}