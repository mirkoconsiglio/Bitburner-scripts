import {getCrimes} from '/utils.js';

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	return [...getCrimes()];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	// noinspection InfiniteLoopJS
	while (true) {
		ns.tail(); // Necessary to exit script
		await ns.sleep(ns.commitCrime(ns.args[0] ?? ns.getPlayer().strength < 50 ? 'mug' : 'homicide') + 100);
	}
}