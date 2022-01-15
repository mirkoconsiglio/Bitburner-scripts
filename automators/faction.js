import {getFactions} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');

	let factions = getFactions();
	let args = ns.flags([
		['hacking', false],
		['field', false],
		['security', false]
	]);

	let workType;
	if (args.hacking) workType = 'Hacking Contracts';
	else if (args.field) workType = 'Field Work';
	else if (args.security) workType = 'Security Work';
	else {
		ns.tprint(`Invalid work type.`);
		ns.exit();
	}

	for (let i = 0; i < args._.length; i += 2) {
		let faction = factions.find(faction => faction.toLowerCase() === args._[i]);
		if (faction) {
			ns.tprint(`Working for ${faction}.`);
			while (ns.getFactionRep(faction) < args._[i + 1]) {
				ns.workForFaction(faction, workType, ns.isFocused());
				await ns.sleep(1000);
			}
		} else ns.tprint(`Could not find faction.`);
	}
}