import {disableSleeveAutopilot} from 'sleeve/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['crime', 'Homicide'],
		['sleeve', -1],
		['all', false]
	]);
	if (!args.all && args.sleeve === -1) throw new Error(`Need to specify --sleeve number or --all`);

	if (args.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			disableSleeveAutopilot(ns, i);
			ns.sleeve.setToCommitCrime(i, args.crime);
		}
	} else {
		disableSleeveAutopilot(ns, args.sleeve);
		ns.sleeve.setToCommitCrime(args.sleeve, args.crime);
	}
}