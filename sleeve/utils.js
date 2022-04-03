import {getPortNumbers, modifyFile} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @param {number} sleeveNumber
 */
export async function disableSleeveAutopilot(ns, sleeveNumber) {
	await modifyFile(ns, getPortNumbers().sleeve, {[sleeveNumber]: {autopilot: false}});
}