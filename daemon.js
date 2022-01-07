import { getAccessibleServers, findPlaceToRun, getFreeRam } from 'utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	let data = packageData(ns);

	let i = 0;
	while (true) {
		let sec = ns.getServerSecurityLevel(data.target);
		let money = ns.getServerMoneyAvailable(data.target);
		if (!(money === data.maxMoney) || !(sec === data.minSec)) {
			ns.print(`Priming ${data.target}.`);
			let primed = await primeTarget(ns, sec, money, data);
			if (primed) ns.print(`${data.target} is primed.`);
			else continue;
		}

		let info = getInfo(ns, data);
		if (info) ns.print(info);
		else continue;

		let c = 0;
		while (c < info.cycleCount) {
			if (info.cycleRAM < info.freeRAM) {
				ns.print(`Running cycle ${c + 1}.`);
				if (info.hackThreads > 0 && info.hackThreads < Infinity) ns.exec('hack.js', data.host, info.hackThreads, data.target, info.hackDelay, i);
				if (info.growThreads > 0 && info.growThreads < Infinity) ns.exec('grow.js', data.host, info.growThreads, data.target, info.growDelay, i);
				if (info.weakenThreads > 0 && info.weakenThreads < Infinity) ns.exec('weaken.js', data.host, info.weakenThreads, data.target, info.weakenDelay, i);
				i++;
				c++;
			}
			await ns.sleep(info.cycleDelay);
		}
	}
}

async function primeTarget(ns, sec, money, data) {
	let growThreads = Math.ceil(ns.growthAnalyze(data.target, data.maxMoney / money));
	if (growThreads === Infinity) growThreads = Math.ceil(ns.growthAnalyze(data.target, 10));
	let weakenThreads = Math.ceil((sec - data.minSec + growThreads * data.growSec) / data.weakenSec);

	let growTime = ns.getGrowTime(data.target);
	let weakenTime = ns.getWeakenTime(data.target);
	let maxTime = Math.max(growTime, weakenTime);

	let grown = growThreads === 0;
	let weakened = weakenThreads === 0;

	let freeRAM = ns.getServerMaxRam(data.host) - ns.getServerUsedRam(data.host);
	if (data.host === 'home') freeRAM -= 20;
	let primeRAM = data.growscriptRam * growThreads + data.weakenscriptRam * weakenThreads;

	if (primeRAM > freeRAM) {
		ns.print(`Not enough RAM on ${data.host} to prime ${data.target}.`);
		ns.print(`Priming RAM: ${primeRAM}. Available RAM: ${freeRAM}.`);
		ns.print(`Finding other hosts to prime ${data.target}`);

		let servers = getAccessibleServers(ns);
		let freeRams = getFreeRam(ns, servers);

		let growFound = true;
		if (!grown) {
			growFound = findPlaceToRun(ns, 'grow.js', growThreads, freeRams, [data.target]);
		}
		if (growFound) grown = true;

		let weakenFound = true;
		if (!weakened) {
			weakenFound = findPlaceToRun(ns, 'weaken.js', weakenThreads, freeRams, [data.target]);
		}
		if (weakenFound) weakened = true;

		if (!growFound) await ns.sleep(1000);
		else if (!weakenFound) await ns.sleep(1000);
		else await ns.sleep(maxTime + 1000);

		return grown && weakened;
	}
	else {
		if (!grown) {
			ns.exec('grow.js', data.host, growThreads, data.target);
			grown = true;
		}
		if (!weakened) {
			ns.exec('weaken.js', data.host, weakenThreads, data.target);
			weakened = true;
		}
		await ns.sleep(maxTime + 1000);
		return grown && weakened;
	}
}

function getInfo(ns, data) {
	let hackTime = ns.getHackTime(data.target);
	let growTime = ns.getGrowTime(data.target);
	let weakenTime = ns.getWeakenTime(data.target);
	let maxTime = Math.max(hackTime, growTime, weakenTime);

	let hackThreads = Math.floor(ns.hackAnalyzeThreads(data.target, data.drainPercent * data.maxMoney)) // Getting the amount of threads I need to hack 50% of the funds
	let growThreads = Math.ceil(ns.growthAnalyze(data.target, data.increasePercent)); // Getting the amount of threads I need to grow 100%
	let weakenThreads = Math.ceil((hackThreads * data.hackSec + growThreads * data.growSec) / data.weakenSec); // Getting required threads to fully weaken the target

	let freeRAM = ns.getServerMaxRam(data.host) - ns.getServerUsedRam(data.host);
	if (data.host === 'home') freeRAM -= 16;
	let cycleRAM = data.hackscriptRam * hackThreads + data.growscriptRam * growThreads + data.weakenscriptRam * weakenThreads; // Calculating how much RAM is used for a single run
	let cycleCount = Math.floor(freeRAM / cycleRAM);
	let cycleDelay = maxTime / cycleCount;

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

		if (data.drainPercent < 0.01) {
			ns.tprint(`Drain percent too low. Exiting daemon on ${data.host} targeting ${data.target}.`);
			ns.exit();
		}

		return;
	}

	let runTime = cycleCount * cycleDelay;

	let offset = cycleDelay / 2;
	let hackOffset = offset / 2;
	let growOffset = offset / 4;

	let hackDelay = maxTime - hackTime - hackOffset;
	let growDelay = maxTime - growTime - growOffset;
	let weakenDelay = maxTime - weakenTime;

	return { runTime, cycleCount, cycleRAM, freeRAM, maxTime, weakenTime, growTime, hackTime, weakenThreads, growThreads, hackThreads, weakenDelay, growDelay, hackDelay, cycleDelay, hackOffset, growOffset, offset };
}

function packageData(ns) {
	const target = ns.args[0];
	const host = ns.getHostname();

	const cycleDelayThresh = 500;
	const growSafety = 1.05;
	const drainPercent = 0.5;
	const increasePercent = 1 / (1 - drainPercent) ** growSafety;

	const minSec = ns.getServerMinSecurityLevel(target);
	const maxMoney = ns.getServerMaxMoney(target);

	const hackSec = 0.002;
	const growSec = 0.004;
	const weakenSec = 0.05;

	const hackscriptRam = ns.getScriptRam('hack.js');
	const growscriptRam = ns.getScriptRam('grow.js');
	const weakenscriptRam = ns.getScriptRam('weaken.js');

	return { target, host, minSec, maxMoney, hackSec, growSec, weakenSec, drainPercent, increasePercent, cycleDelayThresh, hackscriptRam, growscriptRam, weakenscriptRam };
}

export function autocomplete(data) {
	return data.servers;
}