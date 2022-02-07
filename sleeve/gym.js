import {getScripts} from '/utils/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['str', false],
		['def', false],
		['dex', false],
		['agi', false],
		['gym', 'Powerhouse Gym']
	]);

	let city;
	if (args.gym === 'Crush Fitness Gym' || args.gym === 'Snap Fitness Gym') city = 'Aevum';
	else if (args.gym === 'Iron Gym' || args.gym === 'Powerhouse Gym') city = 'Sector-12';
	else if (args.gym === 'Millenium Fitness Gym') city = 'Volhaven';
	else throw new Error(`Invalid gym`);

	let stat;
	if (args.str) stat = 'Strength';
	else if (args.def) stat = 'Defense';
	else if (args.dex) stat = 'Dexterity';
	else if (args.agi) stat = 'Agility';
	else throw new Error('Invalid stat');

	const scripts = getScripts();
	if (ns.isRunning(scripts.sleeve, 'home') &&
		await ns.prompt(`This requires that the sleeve manager is killed, continue?`)) {
		ns.kill(scripts.sleeve, 'home');
	} else ns.exit();

	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
		if (city) ns.sleeve.travel(i, city);
		ns.sleeve.setToGymWorkout(i, args.gym, stat);
	}
}