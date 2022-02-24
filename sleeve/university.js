// noinspection JSUnresolvedVariable

import {getScripts} from '/utils/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['university', 'ZB Institute of Technology'],
		['course', 'Leadership']
	]);

	let city;
	if (args.university === 'Summit University') city = 'Aevum';
	else if (args.university === 'Rothman University') city = 'Sector-12';
	else if (args.university === 'ZB Institute of Technology') city = 'Volhaven';
	else throw new Error(`Invalid university`);

	const scripts = getScripts();
	if (ns.isRunning(scripts.sleeve, 'home') &&
		await ns.prompt(`This requires that the sleeve manager is killed, continue?`)) {
		ns.kill(scripts.sleeve, 'home');
	} else ns.exit();

	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
		if (city) ns.sleeve.travel(i, city);
		ns.sleeve.setToUniversityCourse(i, args.university, args.course);
	}
}