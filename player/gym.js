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
	ns.travelToCity(getGymLocation(options.gym));
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
	ns.gymWorkout(gym, 'str');
	while (ns.getPlayer().strength < level) {
		if (ns.getPlayer().className !== 'training your strength at a gym') break;
		await ns.sleep(1000);
	}
	ns.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function workOutDef(ns) {
	ns.gymWorkout(gym, 'def');
	while (ns.getPlayer().defense < level) {
		if (ns.getPlayer().className !== 'training your defense at a gym') break;
		await ns.sleep(1000);
	}
	ns.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function workOutDex(ns) {
	ns.gymWorkout(gym, 'dex');
	while (ns.getPlayer().dexterity < level) {
		if (ns.getPlayer().className !== 'training your dexterity at a gym') break;
		await ns.sleep(1000);
	}
	ns.stopAction();
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
async function workOutAgi(ns) {
	ns.gymWorkout(gym, 'agi');
	while (ns.getPlayer().agility < level) {
		if (ns.getPlayer().className !== 'training your agility at a gym') break;
		await ns.sleep(1000);
	}
	ns.stopAction();
}