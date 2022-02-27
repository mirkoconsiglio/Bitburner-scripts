import {disableSleeveAutopilot} from 'sleeve/utils.js';

export async function main(ns) {
	const args = ns.flags([['all', false]]);
	const sleeveNumber = args.all ? undefined : (args._[0] ?? throw new Error(`Either choose a sleeve number or --all`));

	if (args.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			disableSleeveAutopilot(ns, i);
			ns.sleeve.setToShockRecovery(i);
		}
	} else {
		disableSleeveAutopilot(ns, sleeveNumber);
		ns.sleeve.setToShockRecovery(sleeveNumber);
	}
}