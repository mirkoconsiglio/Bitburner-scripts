import {
	copyScriptsToAll,
	findPlaceToRun,
	getAccessibleServers,
	getFreeRam,
	getOptimalHackable,
	getScripts
} from '/utils/utils.js';

export async function main(ns) {
	await copyScriptsToAll(ns);
	const threads = Number.MAX_VALUE;
	const scripts = getScripts();
	while (true) {
		let servers = getAccessibleServers(ns);
		let hackables = getOptimalHackable(ns, servers);
		let [freeRams, filteredHackables] = getFreeRam(ns, servers, hackables, true);
		for (let target of filteredHackables.reverse()) {
			findPlaceToRun(ns, scripts.share, threads, freeRams);
		}
		await ns.sleep(1000);
	}
}