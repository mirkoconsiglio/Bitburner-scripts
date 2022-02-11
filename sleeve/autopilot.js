import {isUsefulCrime} from '/augmentations/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	while (true) {
		ns.clearLog();
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			// Check for augmentation purchases
			const augmentations = ns.sleeve.getSleevePurchasableAugs(i);
			for (let aug of augmentations) {
				if (isUsefulCrime(ns, aug.name) && ns.getServerMoneyAvailable('home') >= aug.cost) {
					ns.sleeve.purchaseSleeveAug(i, aug.name);
				}
			}
			// Assign crime
			const crime = ns.sleeve.getSleeveStats(i).strength < 50 ? 'Mug' : 'Homicide';
			if (ns.sleeve.getTask(i).crime !== crime) ns.sleeve.setToCommitCrime(i, crime);
			ns.print(`Sleeve ${i}: ${ns.sleeve.getTask(i).crime}`);
		}
		await ns.sleep(1000);
	}
}