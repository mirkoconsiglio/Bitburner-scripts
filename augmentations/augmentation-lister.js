import {getFactions} from '/utils/utils.js';

export async function main(ns) {
	let file = '/augmentations/list.txt';
	let factions = getFactions();
	await ns.write(file, '', 'w');
	for (let faction of factions) {
		await ns.write(file, `\n\n----- ${faction} -----\n`, 'a');
		let augmentations = ns.getAugmentationsFromFaction(faction);
		for (let augmentation of augmentations) {
			if (augmentation !== 'NeuroFlux Governor') {
				await ns.write(file, `\n--- ${augmentation} ---\n`, 'a');
				for (let [stat, multiplier] of Object.entries(ns.getAugmentationStats(augmentation))) {
					await ns.write(file, `${stat}: ${multiplier}\n`, 'a');
				}
			}
		}
	}
}