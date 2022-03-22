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
		['university', 'ZB Institute of Technology'],
		['course', 'Leadership'],
		['all', false]
	]);
	if (!args.all && !args.sleeve) throw new Error(`Need to specify --sleeve number or --all`);

	let city;
	if (args.university === 'Summit University') city = 'Aevum';
	else if (args.university === 'Rothman University') city = 'Sector-12';
	else if (args.university === 'ZB Institute of Technology') city = 'Volhaven';
	else throw new Error(`Invalid university`);

	if (args.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			if (city) ns.sleeve.travel(i, city);
			await disableSleeveAutopilot(ns, i);
			ns.sleeve.setToUniversityCourse(i, args.university, args.course);
		}
	} else {
		await disableSleeveAutopilot(ns, args.sleeve);
		ns.sleeve.setToUniversityCourse(args.sleeve, args.university, args.course);
	}
}