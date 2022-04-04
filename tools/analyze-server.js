import {formatBinary, formatPercentage, formatTime} from '/utils.js';

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
	const usedRam = ns.getServerUsedRam(server);
	const maxRam = ns.getServerMaxRam(server);
	const money = ns.getServerMoneyAvailable(server);
	const maxMoney = ns.getServerMaxMoney(server);
	const minSec = ns.getServerMinSecurityLevel(server);
	const sec = ns.getServerSecurityLevel(server);

	ns.tprint(`
${server}:
    RAM        : ${formatBinary(ns, usedRam * 1e9)} / ${formatBinary(ns, maxRam * 1e9)} (${formatPercentage(ns, usedRam / maxRam * 100)}%)
    $          : ${formatMoney(ns, money)} / ${formatMoney(ns, maxMoney)} (${formatPercentage(ns, money / maxMoney * 100)}%)
    security   : ${minSec.toFixed(2)} / ${sec.toFixed(2)}
    growth     : ${ns.getServerGrowth(server)}
    hack time  : ${formatTime(ns, ns.getHackTime(server))}
    grow time  : ${formatTime(ns, ns.getGrowTime(server))}
    weaken time: ${formatTime(ns, ns.getWeakenTime(server))}
    grow x2    : ${Math.ceil(ns.growthAnalyze(server, 2))} threads
    grow x3    : ${Math.ceil(ns.growthAnalyze(server, 3))} threads
    grow x4    : ${Math.ceil(ns.growthAnalyze(server, 4))} threads
    hack 10%   : ${Math.floor(0.1 / ns.hackAnalyze(server))} threads
    hack 25%   : ${Math.floor(0.25 / ns.hackAnalyze(server))} threads
    hack 50%   : ${Math.floor(0.5 / ns.hackAnalyze(server))} threads
    hackChance : ${formatPercentage(ns.hackAnalyzeChance(server) * 100)}
`);
}