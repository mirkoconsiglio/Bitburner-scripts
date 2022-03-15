import {getDataFromPort, getPorts} from '/utils/utils.js';

/**
 *
 * @returns {string[]}
 */
export function getWorks() {
	return ['security', 'field', 'hacking'];
}

// noinspection JSUnusedGlobalSymbols
/**
 *
 * @param {NS} ns
 * @param {number} sleeveNumber
 */
export function enableSleeveAutopilot(ns, sleeveNumber) {
	const port = ns.getPortHandle(getPorts().sleeve);
	const data = getDataFromPort(port, getDefaultSleeveData(ns), false);
	data[sleeveNumber] = true;
	port.tryWrite(data);
}

/**
 *
 * @param {NS} ns
 * @param {number} sleeveNumber
 */
export function disableSleeveAutopilot(ns, sleeveNumber) {
	const port = ns.getPortHandle(getPorts().sleeve);
	const data = getDataFromPort(port, getDefaultSleeveData(ns), false);
	data[sleeveNumber] = false;
	port.tryWrite(data);
}

/**
 *
 * @param {NS} ns
 * @returns {boolean[]}
 */
export function getDefaultSleeveData(ns) {
	return Array.from({length: ns.sleeve.getNumSleeves()}, _ => true);
}