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
	while (true) {
		let scripts = getScripts();
		let servers = getAccessibleServers(ns);
		let hackables = getOptimalHackable(ns, servers).reverse();
		let [freeRams, filteredHackables] = getFreeRam(ns, servers, hackables);

		for (let target of filteredHackables) {
			findPlaceToRun(ns, scripts.grow, threads, freeRams, [target]);
			findPlaceToRun(ns, scripts.weaken, threads, freeRams, [target]);
		}
		await ns.sleep(1000);
	}
}