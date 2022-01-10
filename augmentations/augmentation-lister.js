import {getFactions} from '/utils/utils.js';

export async function main(ns) {
	let factions = getFactions();
	await ns.write('augmentations-list.txt', '', 'w');
	for (let faction of factions) {
		await ns.write('augmentations-list.txt', `\n\n----- ${faction} -----\n`, 'a');
		let augmentations = ns.getAugmentationsFromFaction(faction);
		for (let augmentation of augmentations) {
			if (augmentation !== 'NeuroFlux Governor') {
				await ns.write('augmentations-list.txt', `\n--- ${augmentation} ---\n`, 'a');
				for (let [stat, multiplier] of Object.entries(ns.getAugmentationStats(augmentation))) {
					await ns.write('augmentations-list.txt', `${stat}: ${multiplier}\n`, 'a');
				}
			}
		}
	}
}