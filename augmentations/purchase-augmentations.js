// noinspection JSUnresolvedVariable

import {
	isPurchasable,
	isUseful,
	isUsefulBladeburner,
	isUsefulCombat,
	isUsefulCompany,
	isUsefulCrime,
	isUsefulFaction,
	isUsefulFocus,
	isUsefulHacking,
	isUsefulHacknet,
	isUsefulPrograms
} from '/augmentations/utils.js';
import {getFactions, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['hacking', false],
		['combat', false],
		['crime', false],
		['company', false],
		['hacknet', false],
		['programs', false],
		['faction', false],
		['bladeburner', false],
		['focus', false],
		['all', false],
		['install', false]
	]);
	const scripts = getScripts();
	// Check criterions for determining what augmentations are useful
	const criterions = [];
	if (args.hacking || args.all) criterions.push(isUsefulHacking);
	if (args.combat || args.all) criterions.push(isUsefulCombat);
	if (args.crime || args.all) criterions.push(isUsefulCrime);
	if (args.company || args.all) criterions.push(isUsefulCompany);
	if (args.hacknet || args.all) criterions.push(isUsefulHacknet);
	if (args.programs || args.all) criterions.push(isUsefulPrograms);
	if (args.faction || args.all) criterions.push(isUsefulFaction);
	if (args.bladeburner || args.all) criterions.push(isUsefulBladeburner);
	if (args.focus || args.all) criterions.push(isUsefulFocus);
	// Augmentation price increase
	let mult = 0;
	for (let i = 0; i < (ns.getOwnedSourceFiles().find(s => s.n === 11) ?? {lvl: 0}).lvl; i++) {
		mult += 4 / Math.pow(2, i);
	}
	const inc = 1.9 * (1 - mult / 100);
	// Get all useful and purchasable augmentations
	let augmentations = [];
	for (let faction of getFactions()) {
		for (let aug of ns.getAugmentationsFromFaction(faction)) {
			if (isUseful(ns, criterions, aug) && isPurchasable(ns, faction, aug, augmentations)) {
				augmentations.push(
					{
						faction: faction,
						name: aug,
						price: ns.getAugmentationPrice(aug)
					}
				);
			}
		}
	}
	// Sell stocks before buying augmentations
	if (ns.getPlayer().hasTixApiAccess) { // Check if player has TIX API
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
		if (stocks && await ns.prompt(`Do you want to sell all shares?`)) {
			// Kill stock script
			ns.scriptKill(scripts.stock, 'home');
			// Sell all stocks
			for (let sym of ns.stock.getSymbols()) {
				ns.stock.sell(sym, ns.stock.getMaxShares(sym));
				if (ns.getPlayer().bitNodeN === 8 || ns.getOwnedSourceFiles().some(s => s.n === 8 && s.lvl > 1)) {
					ns.stock.sellShort(sym, ns.stock.getMaxShares(sym));
				}
			}
		}
	}
	// Sell hashes before buying augmentations
	if (ns.getPlayer().bitNodeN === 9 || ns.getOwnedSourceFiles().some(s => s.n === 9)) { // Check if player has hacknet servers
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
	// Check if there are any purchasable augmentations
	if (augmentations.length > 0) {
		// Sort augmentations according to their price
		augmentations.sort((a, b) => {
			if (b.price > a.price) return 1;
			else if (a.price > b.price) return -1;
			else return ns.getAugmentationPrereq(b.name).length - ns.getAugmentationPrereq(a.name).length;
		});
		// Fit in augs before their prereqs
		const tempAugs = [];
		const coveredIndices = [];
		for (let [i, aug] of augmentations.entries()) {
			if (coveredIndices.includes(i)) continue;
			let prereq = ns.getAugmentationPrereq(aug.name);
			if (prereq.length > 0) recursiveFit(ns, augmentations, tempAugs, coveredIndices, prereq[0]);
			tempAugs.push(aug);
		}
		// Deep copy augmentations
		augmentations = JSON.parse(JSON.stringify(tempAugs));
		// Calculate price of augs
		let stringAugs = '';
		let totalPrice = 0;
		for (let [i, aug] of augmentations.entries()) {
			let updatedAugPrice = aug.price * inc ** i;
			stringAugs += `${aug.name}: ${ns.nFormat(aug.price, '$0.000a')} (${ns.nFormat(updatedAugPrice, '$0.000a')}). `;
			totalPrice += updatedAugPrice;
		}
		// Prompt user for buying augmentations
		if (await ns.prompt(`${stringAugs}Buy augmentations for ${ns.nFormat(totalPrice, '0.000a')}?`)) {
			for (let aug of augmentations) {
				if (ns.purchaseAugmentation(aug.faction, aug.name)) {
					ns.tprint(`Purchased ${aug.name} from ${aug.faction} for ${ns.nFormat(aug.price, '0.000a')}`);
				} else {
					ns.tprint(`Could not purchase ${aug.name} from ${aug.faction}`);
					ns.exit();
				}
			}
		}
	}
	// Prompt user for purchasing NeuroFlux Governor
	if (await ns.prompt(`Purchase NeuroFlux Governor levels?`)) {
		let highestRepFaction;
		let highestRep = 0;
		for (let faction of getFactions()) {
			// Cannot buy NFG from gangs
			if (ns.gang.inGang() && ns.gang.getGangInformation().faction === faction) continue;
			// Cannot buy NFG from Bladeburners
			if (faction === 'Bladeburners') continue;
			// Take highest reputation faction
			if (ns.getFactionRep(faction) > highestRep) {
				highestRep = ns.getFactionRep(faction);
				highestRepFaction = faction;
			}
		}
		let counter = 0;
		while (ns.purchaseAugmentation(highestRepFaction, 'NeuroFlux Governor')) {
			counter++;
		}
		ns.tprint(`Purchased ${counter} levels of NeuroFlux Governor`);
	}
	// Check if The Red Pill is available
	if (ns.getPlayer().factions.includes('Daedalus') &&
		ns.getFactionRep('Daedalus') >= 2.5e6 &&
		!ns.getOwnedAugmentations(true).includes('The Red Pill')) {
		if (await ns.prompt(`Purchase The Red Pill?`)) {
			if (ns.purchaseAugmentation('Daedalus', 'The Red Pill')) {
				ns.tprint(`Purchased The Red Pill`);
			} else {
				ns.tprint(`Could not purchase The Red Pill`);
				ns.exit();
			}
		}
	}
	// Ask to purchase 4S market data and its TIX API
	if (ns.getPlayer().hasTixApiAccess) {
		let cost = 25e9 * ns.getBitNodeMultipliers().FourSigmaMarketDataApiCost;
		if (!ns.getPlayer().has4SDataTixApi && ns.getServerMoneyAvailable('home') >= cost) {
			if (await ns.prompt(`Purchase 4S Data TIX API?`)) ns.stock.purchase4SMarketDataTixApi();
		}
		cost = 1e9 * ns.getBitNodeMultipliers().FourSigmaMarketDataCost;
		if (!ns.getPlayer().has4SData && ns.getServerMoneyAvailable('home') >= cost) {
			if (await ns.prompt(`Purchase 4S Data?`)) ns.stock.purchase4SMarketData();
		}
	}
	// Ask to install augmentations
	if (args.install && await ns.prompt('Install augmentations?')) {
		ns.installAugmentations('cortex.js');
	}
}

function recursiveFit(ns, augmentations, tempAugs, coveredIndices, prereq) {
	let index = augmentations.findIndex(aug => aug.name === prereq);
	if (index >= 0) { // Fit in aug before their prereq
		coveredIndices.push(index);
		let prereq = ns.getAugmentationPrereq(augmentations[index].name);
		if (prereq.length > 0) recursiveFit(ns, augmentations, tempAugs, coveredIndices, prereq[0])
		tempAugs.push(augmentations[index]);
	}
}