import {getFactions} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const file = '/texts/augmentations-list.txt';
	const factions = getFactions();
	await ns.write(file, '', 'w');
	for (let faction of factions) {
		await ns.write(file, `\n\n----- ${faction} -----\n`, 'a');
		let augmentations = ns.getAugmentationsFromFaction(faction);
		for (let augmentation of augmentations) {
			if (augmentation !== 'NeuroFlux Governor') {
				await ns.write(file, `\n--- ${augmentation} ---\n`, 'a');
				let stats = Object.entries(ns.getAugmentationStats(augmentation));
				if (stats.length > 0) {
					for (let [stat, multiplier] of stats) {
						await ns.write(file, `${stat}: ${multiplier}\n`, 'a');
					}
				} else await ns.write(file, `Special\n`, 'a');
				let price = ns.getAugmentationPrice(augmentation);
				let repReq = ns.getAugmentationRepReq(augmentation);
				let prereq = ns.getAugmentationPrereq(augmentation);
				await ns.write(file, `Price: ${ns.nFormat(price, '$0.000a')}\n`, 'a');
				await ns.write(file, `Rep: ${ns.nFormat(repReq, '0.000a')}\n`, 'a');
				if (prereq.length > 0) await ns.write(file, `Prereq: ${prereq}\n`, 'a');
			}
		}
	}
}