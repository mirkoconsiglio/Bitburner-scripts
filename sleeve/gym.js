// noinspection JSUnresolvedVariable

import {disableSleeveAutopilot} from '/sleeve/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['sleeve', undefined],
		['str', false],
		['def', false],
		['dex', false],
		['agi', false],
		['gym', 'Powerhouse Gym'],
		['all', false]
	]);
	if (!args.all && args.sleeve === -1) throw new Error(`Need to specify --sleeve number or --all`);

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

	if (args.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			if (city) ns.sleeve.travel(i, city);
			await disableSleeveAutopilot(ns, i);
			ns.sleeve.setToGymWorkout(i, args.gym, stat);
		}
	} else {
		await disableSleeveAutopilot(ns, args.sleeve);
		ns.sleeve.setToGymWorkout(args.sleeve, args.gym, stat);
	}
}