import {
	isUseful,
	isUsefulCombat,
	isUsefulCompany,
	isUsefulCrime,
	isUsefulFaction,
	isUsefulHackingSkill
} from '/augmentations/utils.js';
import {getPortNumbers, readFromFile} from '/utils.js';

const argsSchema = [
	['disable-augmentation-buying', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [];
}


/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const options = ns.flags(argsSchema);
	const disableAugmentationBuying = options['disable-augmentation-buying'];
	const works = ['Security', 'Field', 'Hacking'];
	const jobs = getJobs();
	const numSleeves = ns.sleeve.getNumSleeves();
	const usefulCombat = Array.from({length: numSleeves}, _ => false);
	const usefulHacking = Array.from({length: numSleeves}, _ => false);
	const usefulFaction = Array.from({length: numSleeves}, _ => false);
	const usefulCompany = Array.from({length: numSleeves}, _ => false);
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		const player = ns.getPlayer();
		const data = readFromFile(ns, getPortNumbers().sleeve);
		const freeSleeves = Object.keys(data).filter(k => data[k]);
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			// Check for useful augmentations
			const criteria = [isUsefulCrime];
			if (usefulCombat[i]) criteria.push(isUsefulCombat);
			if (usefulHacking[i]) criteria.push(isUsefulHackingSkill);
			if (usefulFaction[i]) criteria.push(isUsefulFaction);
			if (usefulCompany[i]) criteria.push(isUsefulCompany);
			// Check for augmentation purchases
			ns.sleeve.getSleevePurchasableAugs(i).forEach(aug => {
				if (!disableAugmentationBuying && isUseful(ns, criteria, aug.name) &&
					ns.getServerMoneyAvailable('home') >= aug.cost &&
					ns.sleeve.getSleeveStats(i).shock === 0) ns.sleeve.purchaseSleeveAug(i, aug.name);
			});
			// Assign tasks
			// Free sleeve copies player working for faction
			if (freeSleeves.includes(i) && player.isWorking && player.workType === 'Working for Faction') {
				const name = player.currentWorkFactionName;
				if (data[i] && ns.sleeve.getTask(i).task !== 'Faction' || !works.includes(ns.sleeve.getTask(i).factionWorkType)) {
					let j = 0;
					while (!ns.sleeve.setToFactionWork(i, name, works[j])) j++;
				}
			}
			// Free sleeve copies player working for company
			else if (freeSleeves.includes(i) && player.isWorking && player.workType === 'Working for Company') {
				const name = player.companyName;
				if (data[i] && ns.sleeve.getTask(i).task !== 'Company') ns.sleeve.setToCompanyWork(i, name);
			}
			// Crime
			else {
				const crime = ns.sleeve.getSleeveStats(i).strength < 50 ? 'Mug' : 'Homicide';
				if (data[i] && ns.sleeve.getTask(i).crime !== crime) ns.sleeve.setToCommitCrime(i, crime);
			}
			// Make relevant augmentations purchasable for sleeves
			const task = ns.sleeve.getTask(i);
			if (task.task === 'Faction') {
				ns.print(`Sleeve ${i}: Working for ${task.location}`);
				usefulFaction[i] = true;
				if (task.factionWorkType === 'Security' || task.factionWorkType === 'Field') usefulCombat[i] = true;
				if (task.factionWorkType === 'Hacking' || task.factionWorkType === 'Field') usefulHacking[i] = true;
			} else if (task.task === 'Company') {
				usefulCompany[i] = true;
				ns.print(`Sleeve ${i}: Working for ${task.location}`);
				for (const [company, job] of Object.entries(player.jobs)) {
					if (company === player.company) {
						const foundJob = Object.values(jobs).find(val => val.name === job);
						if (foundJob.hacking) usefulHacking[i] = true;
						if (foundJob.combat) usefulCombat[i] = true;
					}
				}
			} else if (task.task === 'Crime') ns.print(`Sleeve ${i}: ${task.crime}`);
		}
		await ns.sleep(1000);
	}
}

/**
 *
 * @returns {Object<Object<string, boolean, boolean, boolean>[]>}
 */
function getJobs() {
	return {
		agent: {
			name: 'Agent',
			hacking: true,
			combat: true,
			charisma: true
		},
		business: {
			name: 'Business',
			hacking: true,
			combat: false,
			charisma: true
		},
		it: {
			name: 'IT',
			hacking: true,
			combat: false,
			charisma: true
		},
		security: {
			name: 'Security',
			hacking: true,
			combat: true,
			charisma: true
		},
		software: {
			name: 'Software',
			hacking: true,
			combat: false,
			charisma: true
		},
		software_consultant: {
			name: 'Software Consultant',
			hacking: true,
			combat: false,
			charisma: true
		},
		employee: {
			name: 'Employee',
			hacking: false,
			combat: true,
			charisma: true
		},
		part_time_employee: {
			name: 'part-time Employee',
			hacking: false,
			combat: true,
			charisma: true
		},
		waiter: {
			name: 'Employee',
			hacking: false,
			combat: true,
			charisma: true
		},
		part_time_waiter: {
			name: 'part-time Waiter',
			hacking: false,
			combat: true,
			charisma: true
		}
	};
}