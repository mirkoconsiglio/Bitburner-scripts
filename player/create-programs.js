import {getUsefulPrograms} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	for (const program of getUsefulPrograms()) {
		while (!ns.fileExists(program, 'home')) {
			ns.singularity.createProgram(program, ns.singularity.isFocused());
			await ns.sleep(1000);
		}
		ns.tprint(`${program} created`);
	}
}