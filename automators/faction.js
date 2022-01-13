import {getFactions} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');

	let factions = getFactions();
	let flags = factions.map(faction => [faction.toLowerCase(), 0]);
	let args = ns.flags(flags.concat([['hacking', false], ['field', false], ['security', false]]));

	let workType;
	if (args.hacking) workType = 'Hacking Contracts';
	else if (args.field) workType = 'Field Work';
	else if (args.security) workType = 'Security Work';
	else {
		ns.tprint(`Invalid work type.`);
		ns.exit();
	}

	for (let faction of factions) {
		if (args[faction.toLowerCase()]) {
			ns.tprint(`Working for ${faction}.`);
			while (ns.getFactionRep(faction) < args[faction.toLowerCase()]) {
				if (!ns.isBusy()) ns.workForFaction(faction, workType, ns.isFocused());
				await ns.sleep(1000);
			}
		}
	}
}