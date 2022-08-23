import {getCrimes} from '/utils.js';

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	return [...getCrimes()];
}

// TODO: Crime now autoloops so we need fix
/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	// noinspection InfiniteLoopJS
	while (true) {
		ns.tail(); // Necessary to exit script
		await ns.sleep(ns.singularity.commitCrime(ns.args[0] ?? ns.getPlayer().skills.strength < 50 ? 'mug' : 'homicide') + 100);
	}
}