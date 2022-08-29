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
	ns.singularity.travelToCity(getUniversityLocation(university));
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
	ns.singularity.universityCourse(university, course, ns.singularity.isFocused());
	while (ns.getPlayer().skills.hacking < level) {
		if (ns.singularity.getCurrentWork()?.classType !== options.course.replace(/\s+/g, '')) break;
		await ns.sleep(1000);
	}
	ns.singularity.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function studyCha(ns) {
	ns.singularity.universityCourse(university, course, ns.singularity.isFocused());
	while (ns.getPlayer().skills.charisma < level) {
		if (ns.getPlayer().workType !== options.course.replace(/\s+/g, '')) break;
		await ns.sleep(1000);
	}
	ns.singularity.stopAction();
}