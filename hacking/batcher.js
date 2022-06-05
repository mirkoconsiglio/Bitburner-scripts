import {
	findPlaceToRun,
	formatPercentage,
	formatRam,
	formatTime,
	getAccessibleServers,
	getFreeRam,
	getFreeRams,
	getScripts,
	printBoth
} from '/utils.js';
// TODO: collision detection
// TODO: no waiting between groups of cycles
// TODO: optimise priming
// noinspection JSUnusedLocalSymbols
export function autocomplete(data, args) {
	return data.servers;
}

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
		const sec = ns.getServerSecurityLevel(data.target);
		const money = ns.getServerMoneyAvailable(data.target);
		if (money < data.maxMoney || sec > data.minSec) {
			ns.print(`Priming ${data.target} in ${formatTime(ns, ns.getWeakenTime(data.target))}`);
			const primed = await primeTarget(ns, sec, money, data);
			if (primed) ns.print(`${data.target} is primed`);
			else continue;
		}
		const info = getInfo(ns, data);
		if (info === 'EXIT') return;
		else if (info === 'REPEAT') continue;
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
		if (info.cycleRAM < info.freeRam) {
			ns.print(`Running cycle ${c}`);
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
	const growth = data.maxMoney / money;
	const growThreads = Math.ceil(ns.growthAnalyze(data.target, Math.max(growth !== Infinity ? growth : 10, 1), data.cores));
	const weakenThreads = Math.ceil((sec - data.minSec + growThreads * data.growSec) / data.weakenSec);

	const growTime = ns.getGrowTime(data.target);
	const weakenTime = ns.getWeakenTime(data.target);

	let grown = growThreads === 0;
	let weakened = weakenThreads === 0;

	const freeRam = getFreeRam(ns, data.host);
	const primeRam = data.growScriptRam * growThreads + data.weakenScriptRam * weakenThreads;

	if (primeRam > freeRam) {
		ns.print(`Not enough RAM on ${data.host} to prime ${data.target}`);
		ns.print(`Priming RAM: ${formatRam(ns, primeRam)}, available RAM: ${formatRam(ns, freeRam)}`);
		ns.print(`Finding other hosts to prime ${data.target}`);
		// Check for RAM to grow server
		let servers = getAccessibleServers(ns);
		let freeRams = getFreeRams(ns, servers);
		let growFound = true;
		if (!grown && growThreads > 0) growFound = findPlaceToRun(ns, data.scripts.grow, growThreads, freeRams, data.target);
		if (growFound) grown = true;
		// Check for RAM to weaken server
		servers = getAccessibleServers(ns);
		freeRams = getFreeRams(ns, servers);
		let weakenFound = true;
		if (!weakened && weakenThreads > 0) weakenFound = findPlaceToRun(ns, data.scripts.weaken, weakenThreads, freeRams, data.target);
		if (weakenFound) weakened = true;
		// Wait until the scripts finish
		await ns.sleep(Math.max(growTime, weakenTime) + 1000);
	} else {
		if (!grown) {
			ns.exec(data.scripts.grow, data.host, growThreads, data.target);
			grown = true;
		}
		if (!weakened) {
			ns.exec(data.scripts.weaken, data.host, weakenThreads, data.target);
			weakened = true;
		}
		await ns.sleep(Math.max(growTime, weakenTime) + 1000);
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
	const hackTime = ns.getHackTime(data.target);
	const growTime = ns.getGrowTime(data.target);
	const weakenTime = ns.getWeakenTime(data.target);

	const hackThreads = Math.floor(ns.hackAnalyzeThreads(data.target, data.drainPercent * data.maxMoney)); // Number of threads to hack 50% of the max money
	const hWeakenThreads = Math.ceil(hackThreads * data.hackSec / data.weakenSec); // Number of threads to weaken after hack
	const growThreads = Math.ceil(ns.growthAnalyze(data.target, data.increasePercent, data.cores)); // Number of threads to grow back to max money
	const gWeakenThreads = Math.ceil(growThreads * data.growSec / data.weakenSec); // Number of threads to weaken after grow

	const freeRam = getFreeRam(ns, data.host);
	let cycleRAM = data.hackScriptRam * hackThreads + data.growScriptRam * growThreads + data.weakenScriptRam * (hWeakenThreads + gWeakenThreads); // Calculating how much RAM is used for a single run
	let cycleCount = Math.floor(freeRam / cycleRAM);
	let cycleDelay = weakenTime / cycleCount;

	if (cycleDelay < data.cycleDelayThresh) {
		cycleRAM = (data.cycleDelayThresh / cycleDelay) * cycleRAM;
		cycleDelay = data.cycleDelayThresh;
		cycleCount = Math.floor(freeRam / cycleRAM);
	}
	if (cycleRAM > freeRam) {
		ns.print(`Not enough RAM on ${data.host} to hack ${data.target}`);
		ns.print(`Cycle RAM: ${cycleRAM}. available RAM: ${freeRam}`);
		data.drainPercent *= freeRam / cycleRAM;
		ns.print(`Reducing drain percent to ${formatPercentage(data.drainPercent)}`);
		if (data.drainPercent < 0.001) {
			printBoth(ns, `Drain percent too low. Exiting daemon on ${data.host} targeting ${data.target}...`);
			return 'EXIT';
		}
		return 'REPEAT';
	}
	ns.print(`Running ${cycleCount} cycles in ${formatTime(ns, cycleCount * cycleDelay / 1000)}`);

	const hackOffset = -0.25 * cycleDelay;
	const hWeakenOffset = 0;
	const growOffset = 0.25 * cycleDelay;
	const gWeakenOffset = 0.5 * cycleDelay;

	const hackDelay = weakenTime - hackTime + hackOffset;
	const hWeakenDelay = hWeakenOffset;
	const growDelay = weakenTime - growTime + growOffset;
	const gWeakenDelay = gWeakenOffset;

	return {
		hackThreads,
		hWeakenThreads,
		growThreads,
		gWeakenThreads,
		freeRam,
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