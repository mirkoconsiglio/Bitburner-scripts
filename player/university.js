// noinspection JSUnresolvedVariable

import {getUniversityLocation} from 'utils.js';

let level;
let course;
let university;

const argsSchema = [
	['university', 'ZB Institute of Technology'],
	['course', 'Leadership'],
	['level', 100]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	level = options.level;
	course = options.course;
	university = options.university;
	ns.travelToCity(getUniversityLocation(university));
	if (options.course === 'Computer Science' ||
		options.course === 'Data Structures' ||
		options.course === 'Networks' ||
		options.course === 'Algorithms') await studyHack(ns);
	else if (options.course === 'Management' ||
		options.course === 'Leadership') await studyCha(ns);
	else throw new Error(`Invalid course`);
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function studyHack(ns) {
	ns.universityCourse(university, course);
	while (ns.getPlayer().hacking < level) {
		if (ns.getPlayer().workType !== 'Studying or Taking a class at university') break;
		await ns.sleep(1000);
	}
	ns.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function studyCha(ns) {
	ns.universityCourse(university, course);
	while (ns.getPlayer().charisma < level) {
		if (ns.getPlayer().workType !== 'Studying or Taking a class at university') break;
		await ns.sleep(1000);
	}
	ns.stopAction();
}