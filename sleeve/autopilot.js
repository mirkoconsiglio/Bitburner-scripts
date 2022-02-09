import {isUsefulCombat} from '/augmentations/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	while (true) {
		ns.clearLog();
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			// Check for augmentation purchases
			const augmentations = ns.sleeve.getSleevePurchasableAugs(i);
			for (let [cost, name] of augmentations) {
				if (isUsefulCombat(ns, name) && ns.getServerMoneyAvailable('home') >= cost) {
					ns.sleeve.purchaseSleeveAug(i, name);
				}
			}
			// Assign task
			const sleeveStats = ns.sleeve.getSleeveStats(i);
			if (ns.heart.break() > -54e3 || (sleeveStats.shock === 0 && sleeveStats.sync === 0)) {
				const crime = sleeveStats.strength < 50 ? 'Mug' : 'Homicide';
				if (ns.sleeve.getTask(i).crime !== crime) ns.sleeve.setToCommitCrime(i, crime);
			} else if (sleeveStats.sync < 100) {
				if (ns.sleeve.getTask(i).task !== 'Synchronize') ns.sleeve.setToSynchronize(i);
			} else {
				if (ns.sleeve.getTask(i).task !== 'Shock Recovery') ns.sleeve.setToShockRecovery(i);
			}
			ns.print(`Sleeve ${i}: ${ns.sleeve.getTask(i).task}`);
		}
		await ns.sleep(1000);
	}
}