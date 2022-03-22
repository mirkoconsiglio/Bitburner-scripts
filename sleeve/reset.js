import {defaultPortData, getPortNumbers, modifyFile} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const portNumber = getPortNumbers().sleeve;
	await modifyFile(ns, portNumber, defaultPortData(portNumber));
}