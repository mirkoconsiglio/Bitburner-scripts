import {isUsefulCrime} from '/augmentations/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	while (true) {
		ns.clearLog();
		const player = ns.getPlayer();
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			// Check for augmentation purchases (only crime)
			const augmentations = ns.sleeve.getSleevePurchasableAugs(i);
			for (let aug of augmentations) {
				if (isUsefulCrime(ns, aug.name) && ns.getServerMoneyAvailable('home') >= aug.cost) {
					ns.sleeve.purchaseSleeveAug(i, aug.name);
				}
			}
			// Assign tasks
			if (i === 0 && player.isWorking && player.workType === 'Working for Faction') { // Sleeve 0 copies player
				const name = player.currentWorkFactionName;
				const workType = player.workType;
				if (ns.sleeve.getTask(i).task !== 'Working for Faction' ||
					ns.sleeve.getTask(i).factionWorkType !== workType) ns.sleeve.setToFactionWork(i, name, workType);
				ns.print(`Sleeve ${i}: ${ns.sleeve.getTask(i).factionWorkType}`);
			} else if (i === 0 && player.isWorking && player.workType === 'Working for Company') { // Sleeve 0 copies player
				const name = player.currentWorkFactionName;
				if (ns.sleeve.getTask(i).task !== 'Working for Company') ns.sleeve.setToCompanyWork(i, name);
				ns.print(`Sleeve ${i}: ${ns.sleeve.getTask(i).factionWorkType}`);
			} else { // Crime
				const crime = ns.sleeve.getSleeveStats(i).strength < 50 ? 'Mug' : 'Homicide';
				if (ns.sleeve.getTask(i).crime !== crime) ns.sleeve.setToCommitCrime(i, crime);
				ns.print(`Sleeve ${i}: ${ns.sleeve.getTask(i).crime}`);
			}
		}
		await ns.sleep(1000);
	}
}