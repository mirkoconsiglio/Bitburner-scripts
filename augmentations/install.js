import {getScripts} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	if (await ns.prompt('Install augmentations?')) ns.singularity.installAugmentations(getScripts().cortex);
}