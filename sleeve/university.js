import {disableSleeveAutopilot} from '/sleeve/utils.js';
import {getUniversities, getUniversityLocation} from '/utils.js';

const argsSchema = [
	['sleeve', undefined],
	['university', 'ZB Institute of Technology'],
	['course', 'Algorithms'],
	['all', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [...getUniversities()];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	if (!options.all && !options.sleeve) throw new Error(`Need to specify --sleeve 'number' or --all`);
	// Get university location
	const location = getUniversityLocation(options.university);
	if (options.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			if (!ns.sleeve.travel(i, location)) throw new Error(`Could not travel sleeve to correct location`);
			await disableSleeveAutopilot(ns, i);
			ns.sleeve.setToUniversityCourse(i, options.university, options.course);
		}
	} else {
		if (!ns.sleeve.travel(options.sleeve, location)) throw new Error(`Could not travel sleeve to correct location`);
		await disableSleeveAutopilot(ns, options.sleeve);
		ns.sleeve.setToUniversityCourse(options.sleeve, options.university, options.course);
	}
}