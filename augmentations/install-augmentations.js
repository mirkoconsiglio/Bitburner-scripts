export async function main(ns) {
	if (await ns.prompt('Install augmentations?')) {
		ns.installAugmentations('cortex.js');
	}
}