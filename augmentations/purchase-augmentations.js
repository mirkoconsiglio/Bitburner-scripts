import {
	isUsefulBladeburner,
	isUsefulCombat,
	isUsefulCompany,
	isUsefulGeneral,
	isUsefulHacking,
	isUsefulHacknet
} from '/augmentations/utils.js';
import {getFactions} from '/utils/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['hacking', false],
		['combat', false],
		['company', false],
		['hacknet', false],
		['bladeburner', false],
		['install', false]
	]);

	// Check criterions for determining if augmentations are useful
	const criterions = [isUsefulGeneral];
	if (args.hacking) criterions.push(isUsefulHacking);
	if (args.combat) criterions.push(isUsefulCombat);
	if (args.company) criterions.push(isUsefulCompany);
	if (args.hacknet) criterions.push(isUsefulHacknet);
	if (args.bladeburner) criterions.push(isUsefulBladeburner);

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
			if (ns.isRunning('/stock-market/stock-market.js', 'home')) {
				ns.kill('/stock-market/stock-market.js', 'home');
			}
			// Sell all stocks
			for (let sym of ns.stock.getSymbols()) {
				ns.stock.sell(sym, ns.stock.getMaxShares(sym));
				if (ns.getPlayer().bitNodeN === 8 || ns.getOwnedSourceFiles().some(s => s.n === 8 && s.lvl > 1)) {
					ns.stock.sellShort(sym, ns.stock.getMaxShares(sym));
				}
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
		let tempAugs = [];
		let coveredIndices = [];
		for (let [i, aug] of augmentations.entries()) {
			if (coveredIndices.includes(i)) continue;
			let prereq = ns.getAugmentationPrereq(aug.name);
			if (prereq.length > 0) {
				let index = augmentations.findIndex(aug => aug.name === prereq[0]);
				if (index >= 0) { // Fit in aug before their prereq
					tempAugs.splice(i, 0, augmentations[index]);
					coveredIndices.push(index);
				}
			}
			tempAugs.push(aug);
		}
		// Deep copy augmentations
		augmentations = JSON.parse(JSON.stringify(tempAugs));

		// Calculate price of augs
		let stringAugs = '';
		let totalPrice = 0;
		for (let [i, aug] of augmentations.entries()) {
			let updatedAugPrice = aug.price * 1.9 ** i;
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
			if (ns.getFactionRep(faction) > highestRep) {
				highestRep = ns.getFactionRep(faction);
				highestRepFaction = faction;
			}
		}

		let counter = 0;
		while (ns.purchaseAugmentation(highestRepFaction, 'NeuroFlux Governor')) {
			counter++;
		}
		ns.tprint(`Purchased ${counter} levels of NeuroFlux Governor.`);
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
		if (!ns.getPlayer().has4SDataTixApi && ns.getServerMoneyAvailable('home') >= 25e9) {
			if (await ns.prompt(`Purchase 4S Data TIX API?`)) ns.stock.purchase4SMarketDataTixApi();
		}
		if (!ns.getPlayer().has4SData && ns.getServerMoneyAvailable('home') >= 1e9) {
			if (await ns.prompt(`Purchase 4S Data?`)) ns.stock.purchase4SMarketData();
		}
	}

	// Ask to install augmentations
	if (args.install && await ns.prompt('Install augmentations?')) {
		ns.installAugmentations('cortex.js');
	}
}

export function isPurchasable(ns, faction, name, augmentations) {
	let facRep = ns.getFactionRep(faction);
	let price = ns.getAugmentationPrice(name);
	let repReq = ns.getAugmentationRepReq(name);

	return !(facRep < repReq || // Faction reputation prerequisite
		ns.getServerMoneyAvailable('home') < price || // Check if it is able to be bought
		augmentations.some(aug => aug.name === name) || // Check to see if it can be bought from another faction
		ns.getOwnedAugmentations(true).includes(name) // Check if already bought
	);
}

function isUseful(ns, criterions, name) {
	for (let criterion of criterions) {
		if (criterion(ns, name)) return true;
	}
	return false;
}