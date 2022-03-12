/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	if (await ns.prompt('Install augmentations?')) {
		ns.installAugmentations('cortex.js');
	}
}