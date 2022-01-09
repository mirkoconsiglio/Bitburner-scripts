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
	while (true) {
		manageAndHack(ns);
		await ns.sleep(1000);
	}
}

export function manageAndHack(ns) {
	let scripts = getScripts();
	let servers = getAccessibleServers(ns);
	let hackables = getOptimalHackable(ns, servers);
	let [freeRams, filteredHackables] = getFreeRam(ns, servers, hackables);
	let hackstates = getHackStates(ns, servers, filteredHackables);
	for (let target of filteredHackables) {
		let money = ns.getServerMoneyAvailable(target);
		let maxMoney = ns.getServerMaxMoney(target);
		let minSec = ns.getServerMinSecurityLevel(target);
		let sec = ns.getServerSecurityLevel(target);

		let secDiff = sec - minSec;
		if (secDiff > 0) {
			let threads = Math.ceil(secDiff * 20) - hackstates.get(target).weaken;
			if (threads > 0) {
				if (!findPlaceToRun(ns, scripts.weaken, threads, freeRams, [target])) {
					return;
				}
			}
		}

		let moneyPercent = money / maxMoney;
		if (moneyPercent === 0) moneyPercent = 0.1;
		if (moneyPercent < 0.9) {
			let threads = Math.ceil(ns.growthAnalyze(target, 1 / moneyPercent));
			-hackstates.get(target).grow;
			if (threads > 0) {
				if (!findPlaceToRun(ns, scripts.grow, threads, freeRams, [target])) {
					return;
				}
			}
		}

		if (moneyPercent > 0.75 && secDiff < 50) {
			let threads = Math.floor(ns.hackAnalyzeThreads(target, money - (0.4 * maxMoney)))
				- hackstates.get(target).hack;
			if (threads > 0) {
				if (!findPlaceToRun(ns, scripts.hack, threads, freeRams, [target])) {
					return;
				}
			}
		}
	}
}

function getHackStates(ns, servers, hackables) {
	let scripts = getScripts();
	let hackstates = new Map();
	for (let server of servers.values()) {
		for (let hackable of hackables.values()) {
			let weakenScript = ns.getRunningScript(scripts.weaken, server, hackable);
			let growScript = ns.getRunningScript(scripts.grow, server, hackable);
			let hackScript = ns.getRunningScript(scripts.hack, server, hackable);
			if (hackstates.has(hackable)) {
				hackstates.get(hackable).weaken += !weakenScript ? 0 : weakenScript.threads;
				hackstates.get(hackable).grow += !growScript ? 0 : growScript.threads;
				hackstates.get(hackable).hack += !hackScript ? 0 : hackScript.threads;
			} else {
				hackstates.set(hackable, {
					weaken: !weakenScript ? 0 : weakenScript.threads,
					grow: !growScript ? 0 : growScript.threads,
					hack: !hackScript ? 0 : hackScript.threads
				});
			}
		}
	}
	return hackstates;
}