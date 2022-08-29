// noinspection JSUnresolvedVariable

import {getGymLocation} from 'utils.js';

let level;
let gym;

const argsSchema = [
	['str', false],
	['def', false],
	['dex', false],
	['agi', false],
	['all', false],
	['level', 100],
	['gym', 'Powerhouse Gym']
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
	gym = options.gym;
	if (!ns.singularity.travelToCity(getGymLocation(gym))) throw new Error(`Could not travel to correct location`);
	if (options.str || options.all) await workOutStr(ns);
	if (options.def || options.all) await workOutDef(ns);
	if (options.dex || options.all) await workOutDex(ns);
	if (options.agi || options.all) await workOutAgi(ns);
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function workOutStr(ns) {
	ns.singularity.gymWorkout(gym, 'str', ns.singularity.isFocused());
	while (ns.getPlayer().skills.strength < level) {
		if (ns.singularity.getCurrentWork()?.classType !== 'GYMSTRENGTH') break;
		await ns.sleep(1000);
	}
	ns.singularity.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function workOutDef(ns) {
	ns.singularity.gymWorkout(gym, 'def', ns.singularity.isFocused());
	while (ns.getPlayer().defense < level) {
		if (ns.singularity.getCurrentWork()?.classType !== 'GYMDEFENSE') break;
		await ns.sleep(1000);
	}
	ns.singularity.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function workOutDex(ns) {
	ns.singularity.gymWorkout(gym, 'dex', ns.singularity.isFocused());
	while (ns.getPlayer().dexterity < level) {
		if (ns.singularity.getCurrentWork()?.classType !== 'GYMDEXTERITY') break;
		await ns.sleep(1000);
	}
	ns.singularity.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function workOutAgi(ns) {
	ns.singularity.gymWorkout(gym, 'agi', ns.singularity.isFocused());
	while (ns.getPlayer().skills.agility < level) {
		if (ns.singularity.getCurrentWork()?.classType !== 'GYMAGILITY') break;
		await ns.sleep(1000);
	}
	ns.singularity.stopAction();
}