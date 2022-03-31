import {disableSleeveAutopilot} from '/sleeve/utils.js';
import {getCrimes} from '/utils.js';

const argsSchema = [
	['crime', 'homicide'],
	['sleeve', undefined],
	['all', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [...getCrimes()];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	if (!options.all && !options.sleeve) throw new Error(`Need to specify --sleeve "number" or --all`);
	if (options.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			await disableSleeveAutopilot(ns, i);
			ns.sleeve.setToCommitCrime(i, options.crime);
		}
	} else {
		await disableSleeveAutopilot(ns, options.sleeve);
		ns.sleeve.setToCommitCrime(options.sleeve, options.crime);
	}
}