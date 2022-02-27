// noinspection JSUnresolvedVariable

import {getFactions} from '/utils/utils.js';
import {disableSleeveAutopilot} from 'sleeve/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['hacking', false],
		['field', false],
		['security', false]
	]);
	const sleeveNumber = args._[0] ?? throw new Error(`Need to specify sleeve number`);
	const faction = args._[1] ?? throw new Error(`Need to specify company`);

	const foundFaction = getFactions().find(f => f.toLowerCase() === faction.toLowerCase());
	if (!foundFaction) {
		ns.tprint(`Could not find ${faction}`);
		ns.exit();
	}

	let workType;
	if (args.hacking) workType = 'Hacking Contracts';
	else if (args.field) workType = 'Field Work';
	else if (args.security) workType = 'Security Work';
	else throw new Error(`Invalid work type`);

	disableSleeveAutopilot(ns, sleeveNumber);
	ns.sleeve.setToFactionWork(sleeveNumber, foundFaction, workType);
}