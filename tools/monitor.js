import {formatMoney, formatPercentage, formatTime} from '/utils.js';

export function autocomplete(data) {
	return data.servers;
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.tail();
	ns.disableLog('ALL');
	// noinspection InfiniteLoopJS
	while (true) {
		const server = ns.args[0];
		let money = ns.getServerMoneyAvailable(server);
		if (money === 0) money = 1;
		const maxMoney = ns.getServerMaxMoney(server);
		const minSec = ns.getServerMinSecurityLevel(server);
		const sec = ns.getServerSecurityLevel(server);
		ns.clearLog(server);
		ns.print(`${server} :`);
		ns.print(` $        : ${formatMoney(ns, money)} / ${formatMoney(ns, maxMoney)} (${formatPercentage(money / maxMoney)})`);
		ns.print(` security : +${sec - minSec}`);
		ns.print(` hack     : ${formatTime(ns, ns.getHackTime(server))} (t=${Math.ceil(ns.hackAnalyzeThreads(server, money))})`);
		ns.print(` grow     : ${formatTime(ns, ns.getGrowTime(server))} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`);
		ns.print(` weaken   : ${formatTime(ns, ns.getWeakenTime(server))} (t=${Math.ceil((sec - minSec) * 20)})`);
		await ns.sleep(100);
	}
}