import {disableSleeveAutopilot} from '/sleeve/utils.js';
import {getGymLocation, getGyms} from '/utils.js';

const argsSchema = [
	['sleeve', undefined],
	['str', false],
	['def', false],
	['dex', false],
	['agi', false],
	['gym', 'Powerhouse Gym'],
	['all', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [...getGyms()];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	if (!options.all && !options.sleeve) throw new Error(`Need to specify --sleeve 'number' or --all`);
	// Get gym location
	const location = getGymLocation(options.gym);
	// Get stat to train
	if (!options.str && !options.def && !options.dex && !options.agi)
		throw new Error(`Specify --str, --def, --dex or --agi for stat to train`);
	const stat = options.str ? 'Strength' : options.def ? 'Defense' : options.dex ? 'Dexterity' : 'Agility';
	if (options.all) {
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			if (!ns.sleeve.travel(i, location)) throw new Error(`Could not travel sleeve to correct location`);
			await disableSleeveAutopilot(ns, i);
			ns.sleeve.setToGymWorkout(i, options.gym, stat);
		}
	} else {
		if (!ns.sleeve.travel(options.sleeve, location)) throw new Error(`Could not travel sleeve to correct location`);
		await disableSleeveAutopilot(ns, options.sleeve);
		ns.sleeve.setToGymWorkout(options.sleeve, options.gym, stat);
	}
}