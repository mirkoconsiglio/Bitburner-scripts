import {getCities} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const moneyThreshold = ns.args[0];
	const cities = getCities();
	// noinspection InfiniteLoopJS
	while (true) {
		while (ns.getPlayer().money > moneyThreshold) {
			for (const city of cities) ns.travelToCity(city);
			await ns.asleep(1);
		}
	}
}