import {
	isUseful,
	isUsefulCombat,
	isUsefulCompany,
	isUsefulCrime,
	isUsefulFaction,
	isUsefulHackingSkill
} from '/augmentations/utils.js';
import {defineAutopilotData, getAutopilotData, getWorks} from '/sleeve/utils.js';
import {getJobs} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	const works = getWorks();
	const jobs = getJobs();
	const numSleeves = ns.sleeve.getNumSleeves();
	const usefulCombat = Array.from({length: numSleeves}, _ => false);
	const usefulHacking = Array.from({length: numSleeves}, _ => false);
	const usefulFaction = Array.from({length: numSleeves}, _ => false);
	const usefulCompany = Array.from({length: numSleeves}, _ => false);
	defineAutopilotData(ns);
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		const player = ns.getPlayer();
		const autopilot = getAutopilotData(ns);

		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			// Check for useful augmentations
			const criterions = [isUsefulCrime];
			if (usefulCombat[i]) criterions.push(isUsefulCombat);
			if (usefulHacking[i]) criterions.push(isUsefulHackingSkill);
			if (usefulFaction[i]) criterions.push(isUsefulFaction);
			if (usefulCompany[i]) criterions.push(isUsefulCompany);
			// Check for augmentation purchases
			const augmentations = ns.sleeve.getSleevePurchasableAugs(i);
			for (let aug of augmentations) {
				if (isUseful(ns, criterions, aug.name) && ns.getServerMoneyAvailable('home') >= aug.cost) {
					ns.sleeve.purchaseSleeveAug(i, aug.name);
				}
			}
			// Assign tasks
			// Sleeve 0 copies player working for faction
			if (i === 0 && player.isWorking && player.workType === 'Working for Faction') {
				const name = player.currentWorkFactionName;
				if (autopilot[i] && ns.sleeve.getTask(i).task !== 'Faction' || !works.includes(ns.sleeve.getTask(i).factionWorkType)) {
					let j = 0;
					while (!ns.sleeve.setToFactionWork(i, name, works[j])) {
						j++;
					}
				}
				ns.print(`Sleeve ${i}: Working for ${name}`);
			}
			// Sleeve 0 copies player working for company
			else if (i === 0 && player.isWorking && player.workType === 'Working for Company') {
				const name = player.companyName;
				if (autopilot[i] && ns.sleeve.getTask(i).task !== 'Company') ns.sleeve.setToCompanyWork(i, name);
				ns.print(`Sleeve ${i}: Working for ${name}`);
			}
			// Crime
			else {
				const crime = ns.sleeve.getSleeveStats(i).strength < 50 ? 'Mug' : 'Homicide';
				if (autopilot[i] && ns.sleeve.getTask(i).crime !== crime) ns.sleeve.setToCommitCrime(i, crime);
				ns.print(`Sleeve ${i}: ${ns.sleeve.getTask(i).crime}`);
			}
			// Make relevant augmentations purchasable for sleeves
			const task = ns.sleeve.getTask(i);
			if (task.task === 'Faction') {
				usefulFaction[i] = true;
				if (task.factionWorkType === 'security' || task.factionWorkType === 'field') usefulCombat[i] = true;
				if (task.factionWorkType === 'hacking' || task.factionWorkType === 'field') usefulHacking[i] = true;
			} else if (task.task === 'Company') {
				usefulCompany[i] = true;
				for (let [company, job] of Object.entries(player.jobs)) {
					if (company === player.company) {
						const foundJob = Object.values(jobs).find(val => val.name === job);
						if (foundJob.hacking) usefulHacking[i] = true;
						if (foundJob.combat) usefulCombat[i] = true;
					}
				}
			}
		}
		await ns.sleep(1000);
	}
}