import { getFactions } from "utils.js";

export async function main(ns) {
	let augmentations = [];
	for (let faction of getFactions()) {
		for (let aug of ns.getAugmentationsFromFaction(faction)) {
			if (purchasable(ns, faction, aug, augmentations)) {
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

	// Split augs according to their prerequisites
	let [prereqAugs, noreqAugs] = splitAugmentations(ns, augmentations);

	// Sort Augs without prerequisites according to their price
	noreqAugs.sort((a, b) => b.price - a.price);

	// Fit in prereq augs after buying their prerequisites
	for (let aug of prereqAugs) {
		let prereq = ns.getAugmentationPrereq(aug.name)[0];
		let index = noreqAugs.findIndex(aug => aug.name === prereq);
		noreqAugs.splice(index + 1, 0, aug);
	}
	augmentations = noreqAugs;

	// Calculate price of augs
	let stringAugs = '';
	let totalPrice = 0;
	for (let [i, aug] of augmentations.entries()) {
		let updatedAugPrice = aug.price * 1.9 ** i;
		stringAugs += `${aug.name}: ${ns.nFormat(aug.price, "0.000a")} (${ns.nFormat(updatedAugPrice, "0.000a")}). `;
		totalPrice += updatedAugPrice;
	}

	// Prompt user for buying augmentations
	if (await ns.prompt(`${stringAugs}Buy augmentations for ${ns.nFormat(totalPrice, "0.000a")}?`)) {
		for (let aug of augmentations) {
			if (ns.purchaseAugmentation(aug.faction, aug.name)) {
				ns.tprint(`Purchased ${aug.name} from ${aug.faction} for ${ns.nFormat(aug.price, "0.000a")}`);
			}
			else {
				ns.tprint(`Could not purchase ${aug.name} from ${aug.faction}`);
				ns.exit();
			}
		}
	}
}

function purchasable(ns, faction, name, augmentations) {
	let facRep = ns.getFactionRep(faction);
	let price = ns.getAugmentationPrice(name);
	let repReq = ns.getAugmentationRepReq(name);

	return !(facRep < repReq || // Faction reputation prerequisite
		ns.getServerMoneyAvailable('home') < price || // Able to buy it
		name === 'NeuroFlux Governor' || // Ignore NFG
		augmentations.some(aug => aug.name === name) || // Already included from somewhere else
		ns.getOwnedAugmentations(true).includes(name) || // Already bought
		!( 	// Looking for hacking, faction rep and special augs.
			ns.getAugmentationStats(name).hacking_mult ||
			ns.getAugmentationStats(name).hacking_exp_mult ||
			ns.getAugmentationStats(name).hacking_chance_mult ||
			ns.getAugmentationStats(name).hacking_speed_mult ||
			ns.getAugmentationStats(name).hacking_money_mult ||
			ns.getAugmentationStats(name).hacking_grow_mult ||
			ns.getAugmentationStats(name).faction_rep_mult ||
			name === 'CashRoot Starter Kit' ||
			name === 'Neuroreceptor Management Implant'
		));
}

function splitAugmentations(ns, augmentations) {
	function condition(aug) {
		let prereq = ns.getAugmentationPrereq(aug.name)[0];
		if (prereq) {
			if (ns.getOwnedAugmentations(true).includes(prereq)) return 1;
			else return 0;
		}
		else return 1;
	}

	return augmentations.reduce((augs, aug) => {
		augs[condition(aug)].push(aug);
		return augs;
	}, [[], []]);
}