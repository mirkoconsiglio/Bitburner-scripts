// noinspection JSUnresolvedVariable

import {
	isUseful,
	isUsefulBladeburner,
	isUsefulCombat,
	isUsefulCompany,
	isUsefulCrime,
	isUsefulFaction,
	isUsefulFocus,
	isUsefulHacking,
	isUsefulHackingSkill,
	isUsefulHacknet,
	isUsefulInfiltration,
	isUsefulPrograms,
	isZeroCost
} from '/augmentations/utils.js';
import {formatMoney, getFactions, getScripts} from '/utils.js';

const argsSchema = [
	['hacking', false],
	['combat', false],
	['crime', false],
	['company', false],
	['hacknet', false],
	['programs', false],
	['faction', false],
	['bladeburner', false],
	['focus', false],
	['hacking-skill', false],
	['infiltration', false],
	['all', false],
	['install', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, args) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	const scripts = getScripts();
	// Check criteria for determining what augmentations are useful
	const criteria = [];
	if (options.hacking || options.all) criteria.push(isUsefulHacking);
	if (options.combat || options.all) criteria.push(isUsefulCombat);
	if (options.crime || options.all) criteria.push(isUsefulCrime);
	if (options.company || options.all) criteria.push(isUsefulCompany);
	if (options.hacknet || options.all) criteria.push(isUsefulHacknet);
	if (options.programs || options.all) criteria.push(isUsefulPrograms);
	if (options.faction || options.all) criteria.push(isUsefulFaction);
	if (options.bladeburner || options.all) criteria.push(isUsefulBladeburner);
	if (options.focus || options.all) criteria.push(isUsefulFocus);
	if (options.infiltration || options.all) criteria.push(isUsefulInfiltration);
	if (options['hacking-skill'] || options.all) criteria.push(isUsefulHackingSkill);
	// Sell stocks before buying augmentations
	if (ns.stock.hasTIXAPIAccess()) { // Check if player has TIX API
		// Check if player has any stocks
		let stocks = false;
		for (let sym of ns.stock.getSymbols()) {
			let pos = ns.stock.getPosition(sym);
			if (pos[0] > 0 || pos[2] > 0) {
				stocks = true;
				break;
			}
		}
		// Ask if player wants to sell stocks
		if (stocks && await ns.prompt(`Do you want to sell all shares?`)) ns.exec(scripts.stock, 'home', 1, '--liquidate');
	}
	// Sell hashes before buying augmentations
	if (ns.getPlayer().bitNodeN === 9 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 9)) { // Check if player has hacknet servers
		// Check if player has any hashes
		if (ns.hacknet.numHashes() > 0 && await ns.prompt(`Do you want to sell all hashes?`)) {
			// Kill hacknet manager
			ns.scriptKill(scripts.hacknet, 'home');
			while (ns.hacknet.numHashes() > 4) {
				// Sell all hashes
				ns.hacknet.spendHashes('Sell for Money');
				await ns.sleep(1);
			}
		}
	}
	// Purchase augmentations
	const purchased = await purchaseAugmentations(ns, criteria);
	if (!purchased) return;
	// Prompt user for purchasing NeuroFlux Governor
	if (await ns.prompt(`Purchase NeuroFlux Governor levels?`)) {
		let highestRepFaction;
		let highestRep = 0;
		for (let faction of getFactions()) {
			// Cannot buy NFG from gangs
			if (ns.gang.inGang() && ns.gang.getGangInformation().faction === faction) continue;
			// Cannot buy NFG from Bladeburners
			if (faction === 'Bladeburners') continue;
			// Cannot buy NFG from Church of the Machine God
			if (faction === 'Church of the Machine God') continue;
			// Take highest reputation faction
			if (ns.singularity.getFactionRep(faction) > highestRep) {
				highestRep = ns.singularity.getFactionRep(faction);
				highestRepFaction = faction;
			}
		}
		let counter = 0;
		while (ns.singularity.purchaseAugmentation(highestRepFaction, 'NeuroFlux Governor')) counter++;
		ns.tprint(`Purchased ${counter} levels of NeuroFlux Governor`);
	}
	// Purchase zero-cost augmentations
	await purchaseAugmentations(ns, [isZeroCost]);
	// Ask to install augmentations
	if (options.install && await ns.prompt('Install augmentations?')) ns.singularity.installAugmentations('cortex.js');
}

async function purchaseAugmentations(ns, criteria) {
	// Augmentation price increase
	const sf11Level = ns.singularity.getOwnedSourceFiles().find(s => s.n === 11)?.lvl;
	let mult = 0;
	if (sf11Level) for (let i = 0; i < sf11Level; i++) mult += 4 / Math.pow(2, i);
	const inc = 1.9 * (1 - mult / 100);
	// Get all useful and purchasable augmentations
	let augmentations = [];
	for (const faction of getFactions()) {
		for (const aug of ns.singularity.getAugmentationsFromFaction(faction)) {
			if (isUseful(ns, criteria, aug) && isPurchasable(ns, faction, aug, augmentations)) {
				augmentations.push(
					{
						faction: faction,
						name: aug,
						price: ns.singularity.getAugmentationPrice(aug)
					}
				);
			}
		}
	}
	// Check if there are any purchasable augmentations
	if (augmentations.length > 0) {
		// Sort augmentations according to their price
		augmentations.sort((a, b) => {
			if (b.price > a.price) return 1;
			else if (a.price > b.price) return -1;
			else return ns.singularity.getAugmentationPrereq(b.name).length - ns.singularity.getAugmentationPrereq(a.name).length;
		});
		// Fit in augs before their prereqs
		const tempAugs = [];
		const coveredIndices = [];
		for (const [i, aug] of augmentations.entries()) { // TODO: fix multiple prereqs getting slotted
			if (coveredIndices.includes(i)) continue;
			const prereqs = ns.singularity.getAugmentationPrereq(aug.name);
			if (prereqs.length > 0) recursiveFit(ns, augmentations, tempAugs, coveredIndices, prereqs);
			tempAugs.push(aug);
		}
		// Deep copy augmentations
		augmentations = JSON.parse(JSON.stringify(tempAugs));
		// Calculate price of augs
		let stringAugs = '';
		let totalPrice = 0;
		for (const [i, aug] of augmentations.entries()) { // TODO: fix bug with prompt text not showing
			const updatedAugPrice = aug.price * inc ** i;
			stringAugs += `${aug.name}: ${formatMoney(ns, aug.price)} (${formatMoney(ns, updatedAugPrice)}). `;
			totalPrice += updatedAugPrice;
		}
		// Prompt user for buying augmentations
		if (await ns.prompt(`${stringAugs}Buy augmentations for ${formatMoney(ns, totalPrice)}?`)) {
			for (const aug of augmentations) {
				if (ns.singularity.purchaseAugmentation(aug.faction, aug.name)) {
					ns.tprint(`Purchased ${aug.name} from ${aug.faction} for ${formatMoney(ns, aug.price)}`);
				} else {
					ns.tprint(`Could not purchase ${aug.name} from ${aug.faction}`);
					return false;
				}
			}
		}
	}
	return true;
}

/**
 *
 * @param {NS} ns
 * @param {string[]} augmentations
 * @param {string[]} tempAugs
 * @param {number[]} coveredIndices
 * @param {string[]} prereq
 */
function recursiveFit(ns, augmentations, tempAugs, coveredIndices, prereqs) {
	while (prereqs.length > 0) {
		const prereq = prereqs.shift();
		const index = augmentations.findIndex(aug => aug.name === prereq);
		if (index >= 0) { // Fit in aug before their prereq
			coveredIndices.push(index);
			const prereqsOfPrereq = ns.singularity.getAugmentationPrereq(augmentations[index].name);
			if (prereqsOfPrereq.length > 0) recursiveFit(ns, augmentations, tempAugs, coveredIndices, prereqsOfPrereq);
			tempAugs.push(augmentations[index]);
		}
	}
}

/**
 *
 * @param {NS} ns
 * @param {string} faction
 * @param {string} name
 * @param {string[]} augmentations
 * @returns {boolean}
 */
function isPurchasable(ns, faction, name, augmentations) {
	let facRep = ns.singularity.getFactionRep(faction);
	let price = ns.singularity.getAugmentationPrice(name);
	let repReq = ns.singularity.getAugmentationRepReq(name);
	return !(facRep < repReq || // Faction reputation prerequisite
		ns.getServerMoneyAvailable('home') < price || // Check if it is able to be bought
		augmentations.some(aug => aug.name === name) || // Check to see if it can be bought from another faction
		ns.singularity.getOwnedAugmentations(true).includes(name) // Check if already bought
	);
}