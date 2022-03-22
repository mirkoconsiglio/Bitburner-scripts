import {disableSleeveAutopilot} from '/sleeve/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['sleeve', -1],
		['all', false]
	]);
	if (!args.all && !args.sleeve) throw new Error(`Need to specify a sleeve number or --all`);

	if (args.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			await disableSleeveAutopilot(ns, i);
			ns.sleeve.setToSynchronize(i);
		}
	} else {
		await disableSleeveAutopilot(ns, args.sleeve);
		ns.sleeve.setToSynchronize(args.sleeve);
	}
}