import {
	copyScriptsToAll,
	findPlaceToRun,
	getAccessibleServers,
	getFreeRam,
	getOptimalHackable,
	getScripts
} from "utils/utils.js";

export async function main(ns) {
	await copyScriptsToAll(ns);
	const threads = 1000;
	let i = 0;
	while (true) {
		let scripts = getScripts();
		let servers = getAccessibleServers(ns);
		let hackables = getOptimalHackable(ns, servers);
		let [freeRams, filteredHackables] = getFreeRam(ns, servers, hackables, true);
		for (let target of filteredHackables.reverse()) {
			findPlaceToRun(ns, scripts.grow, threads, freeRams, [target, 0, i]);
			findPlaceToRun(ns, scripts.weaken, threads, freeRams, [target, 0, i]);
			i++;
		}
		await ns.sleep(1000);
	}
}