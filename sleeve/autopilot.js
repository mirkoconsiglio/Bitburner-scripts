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
// TODO: Add Bladeburner Actions
/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const options = ns.flags(argsSchema);
	const disableAugmentationBuying = options['disable-augmentation-buying'];
	const works = ['SECURITY', 'FIELD', 'HACKING'];
	const jobs = getJobs();
	const numSleeves = ns.sleeve.getNumSleeves();
	const usefulCombat = Array.from({length: numSleeves}, _ => false);
	const usefulHacking = Array.from({length: numSleeves}, _ => false);
	const usefulFaction = Array.from({length: numSleeves}, _ => false);
	const usefulCompany = Array.from({length: numSleeves}, _ => false);
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		const data = readFromFile(ns, getPortNumbers().sleeve);
		const freeSleeves = Object.keys(data).filter(k => data[k]).map(k => Number(k));
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			// Check for useful augmentations
			const criteria = [isUsefulCrime];
			if (data[i].usefulCombat) criteria.push(isUsefulCombat);
			if (data[i].usefulHacking) criteria.push(isUsefulHackingSkill);
			if (data[i].usefulFaction) criteria.push(isUsefulFaction);
			if (data[i].usefulCompany) criteria.push(isUsefulCompany);
			// Check for augmentation purchases
			ns.sleeve.getSleevePurchasableAugs(i).forEach(aug => {
				if (!disableAugmentationBuying && isUseful(ns, criteria, aug.name) &&
					ns.getPlayer().money >= aug.cost && ns.sleeve.getSleeveStats(i).shock === 0)
					ns.sleeve.purchaseSleeveAug(i, aug.name);
			});
			// Assign tasks
			const factionName = ns.singularity.getCurrentWork()?.factionName;
			const companyName = ns.singularity.getCurrentWork()?.companyName;
			// Free sleeve copies player working for faction
			if (freeSleeves.includes(i) && ns.singularity.getCurrentWork()?.type === 'FACTION' &&
				!sameSleeveWork(ns, factionName)) {
				if (data[i].autopilot && ns.sleeve.getTask(i).type !== 'FACTION' ||
					!works.includes(ns.sleeve.getTask(i).factionWorkType)) {
					let j = 0;
					while (!ns.sleeve.setToFactionWork(i, factionName, works[j])) j++;
					freeSleeves.splice(freeSleeves.findIndex(s => s === i), 1);
				}
			}
			// Free sleeve copies player working for company
			else if (freeSleeves.includes(i) && ns.singularity.getCurrentWork()?.type === 'COMPANY' &&
				!sameSleeveWork(ns, companyName)) {
				if (data[i].autopilot && ns.sleeve.getTask(i).type !== 'Company') {
					ns.sleeve.setToCompanyWork(i, companyName);
					freeSleeves.splice(freeSleeves.findIndex(s => s === i), 1);
				}
			}
			// Crime
			else if (!sleeveDoingFactionWork(ns, i, factionName) && !sleeveDoingCompanyWork(ns, i, companyName)) {
				if (data[i].autopilot && ns.sleeve.getTask(i)?.type !== 'CRIME') ns.sleeve.setToCommitCrime(i, 'Homicide');
			}
			// Make relevant augmentations purchasable for sleeves
			const task = ns.sleeve.getTask(i);
			if (task?.type === 'FACTION') {
				ns.print(`Sleeve ${i}: Working for ${task.factionName}`);
				usefulFaction[i] = true;
				if (task.factionWorkType === 'SECURITY' || task.factionWorkType === 'FIELD') usefulCombat[i] = true;
				if (task.factionWorkType === 'HACKING' || task.factionWorkType === 'FIELD') usefulHacking[i] = true;
			} else if (task?.type === 'COMPANY') {
				usefulCompany[i] = true;
				ns.print(`Sleeve ${i}: Working for ${task.companyName}`);
				for (const [company, job] of Object.entries(ns.getPlayer().jobs)) {
					if (company === ns.singularity.getCurrentWork().companyName) {
						const foundJob = Object.values(jobs).find(val => val.name === job);
						if (foundJob.hacking) usefulHacking[i] = true;
						if (foundJob.combat) usefulCombat[i] = true;
					}
				}
			} else if (task?.type === 'CRIME') ns.print(`Sleeve ${i}: ${task.type}`);
			else if (task?.type === 'BLADEBURNER') ns.print(`Sleeve ${i}: ${task.type}`);
			else ns.print(`Sleeve ${i}: IDLE`);
		}
		await ns.sleep(1000);
	}
}

/**
 *
 * @param {NS} ns
 * @param {string} organization
 * @return {boolean}
 */
function sameSleeveWork(ns, organization) {
	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++)
		if (ns.sleeve.getTask(i)?.factionName === organization || ns.sleeve.getTask(i)?.companyName === organization)
			return true;
	return false;
}

/**
 *
 * @param {NS} ns
 * @param {number} sleeveNumber
 * @param {string} factionName
 * @return {boolean}
 */
function sleeveDoingFactionWork(ns, sleeveNumber, factionName) {
	return !!(factionName && ns.sleeve.getTask(sleeveNumber)?.factionName === factionName);
}

/**
 *
 * @param {NS} ns
 * @param {number} sleeveNumber
 * @param {string} factionName
 * @return {boolean}
 */
function sleeveDoingCompanyWork(ns, sleeveNumber, companyName) {
	return !!(companyName && ns.sleeve.getTask(sleeveNumber)?.companyName === companyName);
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