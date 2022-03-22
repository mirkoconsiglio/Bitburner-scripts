// noinspection JSUnresolvedVariable

import {disableSleeveAutopilot} from '/sleeve/utils.js';
import {getFactions} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['sleeve', undefined],
		['faction', undefined],
		['hacking', false],
		['field', false],
		['security', false]
	]);
	if (!args.sleeve) throw new Error(`Need to specify --sleeve number`);
	if (!args.faction) throw new Error(`Need to specify --faction`);

	let workType;
	if (args.hacking) workType = 'Hacking Contracts';
	else if (args.field) workType = 'Field Work';
	else if (args.security) workType = 'Security Work';
	else throw new Error(`Invalid work type`);

	const foundFaction = getFactions().find(f => f.toLowerCase() === args.faction.toLowerCase());
	if (!foundFaction) {
		ns.tprint(`Could not find ${args.faction}`);
		return;
	}

	await disableSleeveAutopilot(ns, sleeveNumber);
	ns.sleeve.setToFactionWork(sleeveNumber, foundFaction, workType);
}