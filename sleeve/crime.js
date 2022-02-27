import {disableSleeveAutopilot} from 'sleeve/utils.js';

export async function main(ns) {
	const args = ns.flags([['all', false]]);
	const crime = args._[0] ?? 'Homicide';
	const sleeveNumber = args.all ? undefined : (args._[1] ?? throw new Error(`Either choose a sleeve number or --all`));

	if (args.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			disableSleeveAutopilot(ns, i);
			ns.sleeve.setToCommitCrime(i, crime);
		}
	} else {
		disableSleeveAutopilot(ns, sleeveNumber);
		ns.sleeve.setToCommitCrime(sleeveNumber, crime);
	}
}