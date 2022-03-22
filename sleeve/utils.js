import {getPortNumbers, modifyFile} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @param {number} sleeveNumber
 */
export async function enableSleeveAutopilot(ns, sleeveNumber) {
	await modifyFile(ns, getPortNumbers().sleeve, {[sleeveNumber]: true});
}

/**
 *
 * @param {NS} ns
 * @param {number} sleeveNumber
 */
export async function disableSleeveAutopilot(ns, sleeveNumber) {
	await modifyFile(ns, getPortNumbers().sleeve, {[sleeveNumber]: false});
}