import {copyScriptsToAll, findPlaceToRun, getAccessibleServers, getFreeRam, getScripts} from '/utils/utils.js';

export async function main(ns) {
	await copyScriptsToAll(ns);
	const threads = Number.MAX_VALUE;
	const scripts = getScripts();
	let i = 0;
	while (true) {
		let servers = getAccessibleServers(ns);
		let freeRams = getFreeRam(ns, servers);
		findPlaceToRun(ns, scripts.grow, threads, freeRams, ['joesguns', 0, i]);
		findPlaceToRun(ns, scripts.weaken, threads, freeRams, ['joesguns', 0, i]);
		await ns.sleep(1000);
	}
}