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
	const crime = ns.args[0] ?? 'homicide';
	ns.singularity.commitCrime(crime, ns.singularity.isFocused());
}