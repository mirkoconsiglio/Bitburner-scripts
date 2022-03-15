import {copyScriptsToAll, findPlaceToRun, getAccessibleServers, getFreeRam, getScripts} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	await copyScriptsToAll(ns);
	const threads = Number.MAX_VALUE;
	const scripts = getScripts();
	let i = 0;
	// noinspection InfiniteLoopJS
	while (true) {
		const servers = getAccessibleServers(ns);
		const freeRams = getFreeRam(ns, servers);
		findPlaceToRun(ns, scripts.share, threads, freeRams, i);
		i++;
		await ns.sleep(1000);
	}
}