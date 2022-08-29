import {getPortNumbers, modifyFile} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	await modifyFile(ns, getPortNumbers().general, {contractor: true});
}