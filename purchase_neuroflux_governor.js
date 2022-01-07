import { getFactions } from "utils.js";

export async function main(ns) {
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