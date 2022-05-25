import {formatMoney, formatNumber, getFactions} from '/utils.js';

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
		const augmentations = ns.singularity.getAugmentationsFromFaction(faction);
		for (const augmentation of augmentations) {
			if (augmentation !== 'NeuroFlux Governor') {
				await ns.write(file, `\n--- ${augmentation} ---\n`, 'a');
				const stats = Object.entries(ns.singularity.getAugmentationStats(augmentation));
				if (stats.length > 0) for (const [stat, multiplier] of stats) await ns.write(file, `${stat}: ${multiplier}\n`, 'a');
				else await ns.write(file, `Special\n`, 'a');
				const price = ns.singularity.getAugmentationPrice(augmentation);
				const repReq = ns.singularity.getAugmentationRepReq(augmentation);
				const prereqs = ns.singularity.getAugmentationPrereq(augmentation);
				await ns.write(file, `Price: ${formatMoney(ns, price)}\n`, 'a');
				await ns.write(file, `Rep: ${formatNumber(ns, repReq)}\n`, 'a');
				if (prereqs.length > 0) for (const prereq of prereqs) await ns.write(file, `Prereq: ${prereq}\n`, 'a');
			}
		}
	}
}