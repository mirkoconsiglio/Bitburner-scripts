import {disableSleeveAutopilot} from 'sleeve/utils.js';

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
	if (!args.all && args.sleeve === -1) throw new Error(`Need to specify a sleeve number or --all`);

	if (args.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			disableSleeveAutopilot(ns, i);
			ns.sleeve.setToShockRecovery(i);
		}
	} else {
		disableSleeveAutopilot(ns, args.sleeve);
		ns.sleeve.setToShockRecovery(args.sleeve);
	}
}