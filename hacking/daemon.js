import {findPlaceToRun, getAccessibleServers, getFreeRam, getScripts, printBoth} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const data = packageData(ns);

	// noinspection InfiniteLoopJS
	while (true) {
		let sec = ns.getServerSecurityLevel(data.target);
		let money = ns.getServerMoneyAvailable(data.target);
		if (!(money === data.maxMoney) || !(sec === data.minSec)) {
			ns.print(`Priming ${data.target} in ${ns.getWeakenTime(data.target).toFixed(2)} seconds`);
			let primed = await primeTarget(ns, sec, money, data);
			if (primed) ns.print(`${data.target} is primed`);
			else continue;
		}
		let info = getInfo(ns, data);
		if (info === 'EXIT') return;
		await hackTarget(ns, info, data);
	}
}

/**
 *
 * @param {NS} ns
 * @param {Object} info
 * @param {Object} data
 * @returns {Promise<void>}
 */
async function hackTarget(ns, info, data) {
	let c = 0;
	while (c < info.cycleCount) {
		if (info.cycleRAM < info.freeRAM) {
			ns.print(`Running cycle ${c}.`);
			if (info.hackThreads > 0) ns.exec(data.scripts.hack, data.host, info.hackThreads, data.target, info.hackDelay, c);
			if (info.hWeakenThreads > 0) ns.exec(data.scripts.weaken, data.host, info.hWeakenThreads, data.target, info.hWeakenDelay, c);
			if (info.growThreads > 0) ns.exec(data.scripts.grow, data.host, info.growThreads, data.target, info.growDelay, c);
			if (info.gWeakenThreads > 0) ns.exec(data.scripts.weaken, data.host, info.gWeakenThreads, data.target, info.gWeakenDelay, c);
			c++;
		}
		await ns.sleep(info.cycleDelay);
	}
}

/**
 *
 * @param {NS} ns
 * @param {number} sec
 * @param {number} money
 * @param {Object} data
 * @returns {Promise<boolean>}
 */
async function primeTarget(ns, sec, money, data) {
	let growth = data.maxMoney / money;
	let growThreads = Math.ceil(ns.growthAnalyze(data.target, Math.max(growth !== Infinity ? growth : 10, 1), data.cores));
	let weakenThreads = Math.ceil((sec - data.minSec + growThreads * data.growSec) / data.weakenSec);

	let weakenTime = ns.getWeakenTime(data.target);

	let grown = growThreads === 0;
	let weakened = weakenThreads === 0;

	let freeRAM = ns.getServerMaxRam(data.host) - ns.getServerUsedRam(data.host);
	let primeRAM = data.growScriptRam * growThreads + data.weakenScriptRam * weakenThreads;

	if (primeRAM > freeRAM) {
		ns.print(`Not enough RAM on ${data.host} to prime ${data.target}`);
		ns.print(`Priming RAM: ${primeRAM.toFixed(2)}, available RAM: ${freeRAM.toFixed(2)}`);
		ns.print(`Finding other hosts to prime ${data.target}`);

		let servers = getAccessibleServers(ns);
		let freeRams = getFreeRam(ns, servers);

		let growFound = true;
		if (!grown && growThreads > 0) growFound = findPlaceToRun(ns, data.scripts.grow, growThreads, freeRams, data.target);
		if (growFound) grown = true;

		let weakenFound = true;
		if (!weakened && weakenThreads > 0) weakenFound = findPlaceToRun(ns, data.scripts.weaken, weakenThreads, freeRams, data.target);
		if (weakenFound) weakened = true;

		if (!growFound) await ns.sleep(1000);
		else if (!weakenFound) await ns.sleep(1000);
		else await ns.sleep(weakenTime + 1000);
	} else {
		if (!grown) {
			ns.exec(data.scripts.grow, data.host, growThreads, data.target);
			grown = true;
		}
		if (!weakened) {
			ns.exec(data.scripts.weaken, data.host, weakenThreads, data.target);
			weakened = true;
		}
		await ns.sleep(weakenTime + 1000);
	}
	return grown && weakened;
}

/**
 *
 * @param {NS} ns
 * @param {Object} data
 * @returns {Object}
 */
function getInfo(ns, data) {
	let hackTime = ns.getHackTime(data.target);
	let growTime = ns.getGrowTime(data.target);
	let weakenTime = ns.getWeakenTime(data.target);

	let hackThreads = Math.floor(ns.hackAnalyzeThreads(data.target, data.drainPercent * data.maxMoney)); // Number of threads to hack 50% of the max money
	let hWeakenThreads = Math.ceil(hackThreads * data.hackSec / data.weakenSec); // Number of threads to weaken after hack
	let growThreads = Math.ceil(ns.growthAnalyze(data.target, data.increasePercent, data.cores)); // Number of threads to grow back to max money
	let gWeakenThreads = Math.ceil(growThreads * data.growSec / data.weakenSec); // Number of threads to weaken after grow

	let freeRAM = ns.getServerMaxRam(data.host) - ns.getServerUsedRam(data.host);
	let cycleRAM = data.hackScriptRam * hackThreads + data.growScriptRam * growThreads + data.weakenScriptRam * (hWeakenThreads + gWeakenThreads); // Calculating how much RAM is used for a single run
	let cycleCount = Math.floor(freeRAM / cycleRAM);
	let cycleDelay = weakenTime / cycleCount;

	if (cycleDelay < data.cycleDelayThresh) {
		cycleRAM = (data.cycleDelayThresh / cycleDelay) * cycleRAM;
		cycleDelay = data.cycleDelayThresh;
		cycleCount = Math.floor(freeRAM / cycleRAM);
	}

	if (cycleRAM > freeRAM) {
		ns.print(`Not enough RAM on ${data.host} to hack ${data.target}.`);
		ns.print(`Cycle RAM: ${cycleRAM}. available RAM: ${freeRAM}.`);
		data.drainPercent *= freeRAM / cycleRAM;
		ns.print(`Reducing drain percent to ${data.drainPercent.toFixed(2)}.`);

		if (data.drainPercent < 0.001) {
			printBoth(ns, `Drain percent too low. Exiting daemon on ${data.host} targeting ${data.target}.`);
			return 'EXIT';
		}

		return getInfo(ns, data);
	}

	ns.print(`Running ${cycleCount} cycles in ${(cycleCount * cycleDelay / 1000).toFixed(2)} seconds.`);

	let hackOffset = -0.25 * cycleDelay;
	let hWeakenOffset = 0
	let growOffset = 0.25 * cycleDelay;
	let gWeakenOffset = 0.5 * cycleDelay;

	let hackDelay = weakenTime - hackTime + hackOffset;
	let hWeakenDelay = hWeakenOffset;
	let growDelay = weakenTime - growTime + growOffset;
	let gWeakenDelay = gWeakenOffset;

	return {
		hackThreads,
		hWeakenThreads,
		growThreads,
		gWeakenThreads,
		freeRAM,
		cycleRAM,
		cycleCount,
		cycleDelay,
		hackDelay,
		hWeakenDelay,
		growDelay,
		gWeakenDelay
	};
}

/**
 *
 * @param {NS} ns
 * @returns {Object}
 */
function packageData(ns) {
	const target = ns.args[0];
	const host = ns.getHostname();
	const cores = ns.getServer(host).cpuCores;

	const cycleDelayThresh = 100;
	const drainPercent = 0.5;
	const increasePercent = 1 / (1 - drainPercent);

	const minSec = ns.getServerMinSecurityLevel(target);
	const maxMoney = ns.getServerMaxMoney(target);

	const hackSec = ns.hackAnalyzeSecurity(1);
	const growSec = ns.growthAnalyzeSecurity(1);
	const weakenSec = ns.weakenAnalyze(1, cores);

	const scripts = getScripts();
	const hackScriptRam = ns.getScriptRam(scripts.hack);
	const growScriptRam = ns.getScriptRam(scripts.grow);
	const weakenScriptRam = ns.getScriptRam(scripts.weaken);

	return {
		target,
		host,
		cores,
		cycleDelayThresh,
		drainPercent,
		increasePercent,
		minSec,
		maxMoney,
		hackSec,
		growSec,
		weakenSec,
		scripts,
		hackScriptRam,
		growScriptRam,
		weakenScriptRam
	};
}

// noinspection JSUnusedGlobalSymbols
/**
 *
 * @param {*} data
 * @returns {string[]}
 */
export function autocomplete(data) {
	// noinspection JSUnresolvedVariable
	return data.servers;
}