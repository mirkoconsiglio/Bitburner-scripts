import {getPorts} from '/utils/utils.js';

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
	const data = port.empty() ? defineAutopilotData(ns) : port.read();
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
	const data = port.empty() ? defineAutopilotData(ns) : port.read();
	data[sleeveNumber] = false;
	port.tryWrite(data);
}

/**
 *
 * @param {NS} ns
 * @param {boolean} peek
 * @returns {boolean[]}
 */
export function getAutopilotData(ns, peek = false) {
	const port = ns.getPortHandle(getPorts().sleeve);
	if (port.empty()) return defineAutopilotData(ns);
	else if (peek) return port.peek();
	else return port.read();
}

/**
 *
 * @param {NS} ns
 * @param {boolean} clear
 * @returns {boolean[]}
 */
export function defineAutopilotData(ns, clear = true) {
	const data = Array.from({length: ns.sleeve.getNumSleeves()}, _ => true);
	const port = ns.getPortHandle(getPorts().sleeve);
	if (clear) port.clear();
	port.tryWrite(data);
	return data;
}