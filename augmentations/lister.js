import {getFactions} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const file = '/texts/augmentations-list.txt';
	const factions = getFactions();
	await ns.write(file, '', 'w');
	for (const faction of factions) {
		await ns.write(file, `\n\n----- ${faction} -----\n`, 'a');
		const augmentations = ns.getAugmentationsFromFaction(faction);
		for (const augmentation of augmentations) {
			if (augmentation !== 'NeuroFlux Governor') {
				await ns.write(file, `\n--- ${augmentation} ---\n`, 'a');
				const stats = Object.entries(ns.getAugmentationStats(augmentation));
				if (stats.length > 0) for (const [stat, multiplier] of stats) await ns.write(file, `${stat}: ${multiplier}\n`, 'a');
				else await ns.write(file, `Special\n`, 'a');
				const price = ns.getAugmentationPrice(augmentation);
				const repReq = ns.getAugmentationRepReq(augmentation);
				const prereq = ns.getAugmentationPrereq(augmentation);
				await ns.write(file, `Price: ${ns.nFormat(price, '$0.000a')}\n`, 'a');
				await ns.write(file, `Rep: ${ns.nFormat(repReq, '0.000a')}\n`, 'a');
				if (prereq.length > 0) await ns.write(file, `Prereq: ${prereq}\n`, 'a');
			}
		}
	}
}