// noinspection JSUnresolvedVariable

import {getFactions} from '/utils/utils.js';
import {disableSleeveAutopilot} from 'sleeve/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['sleeve', -1],
		['faction', ''],
		['hacking', false],
		['field', false],
		['security', false]
	]);
	if (args.sleeve === -1) throw new Error(`Need to specify --sleeve number`);
	if (!args.faction) throw new Error(`Need to specify --faction`);

	let workType;
	if (args.hacking) workType = 'Hacking Contracts';
	else if (args.field) workType = 'Field Work';
	else if (args.security) workType = 'Security Work';
	else throw new Error(`Invalid work type`);

	const foundFaction = getFactions().find(f => f.toLowerCase() === args.faction.toLowerCase());
	if (!foundFaction) {
		ns.tprint(`Could not find ${args.faction}`);
		ns.exit();
	}

	disableSleeveAutopilot(ns, sleeveNumber);
	ns.sleeve.setToFactionWork(sleeveNumber, foundFaction, workType);
}