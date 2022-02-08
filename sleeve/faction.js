import {getFactions, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const factions = getFactions();
	const args = ns.flags([
		['hacking', false],
		['field', false],
		['security', false]
	]);

	const faction = factions.find(faction => faction.toLowerCase() === args._[1].toLowerCase());
	if (!faction) {
		ns.tprint(`Could not find ${args._[1]}`);
		ns.exit();
	}

	let workType;
	if (args.hacking) workType = 'Hacking Contracts';
	else if (args.field) workType = 'Field Work';
	else if (args.security) workType = 'Security Work';
	else throw new Error(`Invalid work type`);

	const scripts = getScripts();
	if (ns.isRunning(scripts.sleeve, 'home') &&
		await ns.prompt(`This requires that the sleeve manager is killed, continue?`)) {
		ns.kill(scripts.sleeve, 'home');
	} else ns.exit();

	ns.sleeve.setToFactionWork(ns.args[0], faction, workType);
}