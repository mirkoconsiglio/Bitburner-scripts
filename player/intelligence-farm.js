import {formatMoney, formatTime, getCities} from '/utils.js';

const argsSchema = [
	['trips-per-cycle', 1e4],
	['money-threshold', 1e12]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, args) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const options = ns.flags(argsSchema);
	const tripsPerCycle = options['trips-per-cycle'];
	const moneyThreshold = options['money-threshold'];
	ns.print(`trips-per-cycle: ${tripsPerCycle}`);
	ns.print(`money-threshold: ${formatMoney(ns, moneyThreshold)}`);
	const cities = getCities();
	const citiesLength = cities.length;
	let justStarted = true;
	let previousInt = ns.getPlayer().skills.intelligence;
	let currentInt = previousInt;
	let previousLevelTime = Date.now();
	let levelupTime;
	let cycles = 0;
	let duration = 0;
	let tripsPerLevel = 0;
	let tripsPerMs = 0;
	// noinspection InfiniteLoopJS
	while (true) {
		while (ns.getPlayer().money > moneyThreshold) {
			for (let i = 0; i < tripsPerCycle; i++) cities.forEach(city => ns.singularity.travelToCity(city));
			await ns.sleep(1);
			cycles++;
			if (previousInt !== ns.getPlayer().skills.intelligence) {
				currentInt = ns.getPlayer().skills.intelligence;
				levelupTime = Date.now();
				duration = levelupTime - previousLevelTime;
				tripsPerLevel = cycles * tripsPerCycle * citiesLength;
				tripsPerMs = Math.floor(tripsPerLevel / duration);
				ns.print(`Level Up: Int ${currentInt}` + (justStarted ? ` partial ` : ` full `) +
					`level in ${formatTime(ns, duration)} & ${formatMoney(ns, tripsPerLevel)} travels`);
				ns.print(`Approximately ${tripsPerMs} trips/ms`);
				previousLevelTime = levelupTime;
				previousInt = currentInt;
				justStarted = false;
				cycles = 0;
			}
		}
		await ns.sleep(10000);
		ns.print(`Below money threshold, waiting 10 seconds`);
	}
}