import {getFactions, isUsefulCombat, isUsefulCompany, isUsefulGeneral, isUsefulHacking, isUsefulHacknet, isUsefulBladeburner} from '../utils/utils';

export async function main(ns) {
	let args = ns.flags([
		['hacking', false],
		['combat', false],
		['company', false],
		['hacknet', false],
		['bladeburner', false]
	]);

	// Check criterions for determining if augmentations are useful
	let criterions = [isUsefulGeneral];
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
			if (pos[0] !== 0 || pos[2] !== 0) {
				stocks = true;
				break;
			}
		}
		// Ask if player wants to sell stocks
		if (stocks && await ns.prompt(`Do you want to sell all shares?`)) {
			// Kill stock script
			if (ns.isRunning('stock_market.js', 'home')) {
				ns.kill('stock_market.js', 'home');
			}
			// Sell all stocks
			for (let sym of ns.stock.getSymbols()) {
				ns.stock.sell(sym, ns.stock.getMaxShares(sym));
				ns.stock.sellShort(sym, ns.stock.getMaxShares(sym));
			}
		}
	}

	// Check if there are any purchasable augmentations
	if (augmentations.length !== 0) {
		// Split augs according to their prerequisites
		let [prereqAugs, noreqAugs] = splitAugmentations(ns, augmentations);

		// Sort Augs without prerequisites according to their price
		noreqAugs.sort((a, b) => b.price - a.price);

		// Fit in prereq augs after buying their prerequisites
		for (let aug of prereqAugs) {
			let prereq = ns.getAugmentationPrereq(aug.name)[0];
			let index = noreqAugs.findIndex(aug => aug.name === prereq);
			if (index >= 0) noreqAugs.splice(index + 1, 0, aug);
		}
		augmentations = noreqAugs;

		// Calculate price of augs
		let stringAugs = '';
		let totalPrice = 0;
		for (let [i, aug] of augmentations.entries()) {
			let updatedAugPrice = aug.price * 1.9 ** i;
			stringAugs += `${aug.name}: ${ns.nFormat(aug.price, '0.000a')} (${ns.nFormat(updatedAugPrice, '0.000a')}). `;
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
	if (ns.getFactionRep('Daedalus') >= 2.5e6 && !ns.getOwnedAugmentations(true).includes('The Red Pill')) {
		if (await ns.prompt(`Purchase The Red Pill?`)) {
			if (ns.purchaseAugmentation('Daedalus', 'The Red Pill')) {
				ns.tprint(`Purchased The Red Pill`);
			} else {
				ns.tprint(`Could not purchase The Red Pill`);
				ns.exit();
			}
		}
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

function splitAugmentations(ns, augmentations) {
	function condition(aug) {
		let prereq = ns.getAugmentationPrereq(aug.name)[0];
		if (prereq) {
			if (ns.getOwnedAugmentations(true).includes(prereq)) return 1;
			else return 0;
		} else return 1;
	}

	return augmentations.reduce((augs, aug) => {
		augs[condition(aug)].push(aug);
		return augs;
	}, [[], []]);
}