import {disableSleeveAutopilot} from '/sleeve/utils.js';

const argsSchema = [
	['sleeve', undefined],
	['all', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	if (!options.all && !options.sleeve) throw new Error(`Need to specify a sleeve number or --all`);

	if (options.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			await disableSleeveAutopilot(ns, i);
			ns.sleeve.setToShockRecovery(i);
		}
	} else {
		await disableSleeveAutopilot(ns, options.sleeve);
		ns.sleeve.setToShockRecovery(options.sleeve);
	}
}