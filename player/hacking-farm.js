import {copyScriptsToAll, findPlaceToRun, getAccessibleServers, getFreeRams, getScripts} from 'utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	await copyScriptsToAll(ns);
	const threads = Number.MAX_SAFE_INTEGER;
	const scripts = getScripts();
	const target = 'joesguns';
	const level = ns.getServerRequiredHackingLevel(target);
	while (ns.getPlayer().skills.hacking < level) {
		await ns.sleep(1000);
	}
	let i = 0;
	// noinspection InfiniteLoopJS
	while (true) {
		const servers = getAccessibleServers(ns);
		const freeRams = getFreeRams(ns, servers);
		findPlaceToRun(ns, scripts.grow, threads, freeRams, target, 0, i);
		findPlaceToRun(ns, scripts.weaken, threads, freeRams, target, 0, i);
		i++;
		await ns.sleep(1000);
	}
}