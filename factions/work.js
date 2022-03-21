// noinspection JSUnresolvedVariable

import {getFactions} from '/My Drive/Games/Bitburner/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');

	const factions = getFactions();
	const args = ns.flags([
		['hacking', false],
		['field', false],
		['security', false]
	]);

	let workType;
	if (args.hacking) workType = 'Hacking Contracts';
	else if (args.field) workType = 'Field Work';
	else if (args.security) workType = 'Security Work';
	else throw new Error(`Invalid work type`);

	for (let i = 0; i < args._.length; i += 2) {
		const faction = factions.find(faction => faction.toLowerCase() === args._[i].toLowerCase());
		if (faction) {
			ns.tprint(`Working for ${faction}`);
			while (ns.getFactionRep(faction) < args._[i + 1]) {
				ns.workForFaction(faction, workType, ns.isFocused());
				await ns.sleep(1000);
			}
		} else ns.tprint(`Could not find ${args._[i]}`);
	}
}