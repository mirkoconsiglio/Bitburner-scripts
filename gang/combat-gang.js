export async function main(ns) {
	ns.disableLog('ALL')

	if (!ns.gang.inGang()) {
		ns.tprint(`You need to join a gang first.`);
		ns.exit();
	} else if (ns.gang.getGangInformation().isHacking) {
		ns.tprint(`Not a combat gang.`);
		ns.exit();
	}

	const gangJoined = ns.gang.getGangInformation().faction;
	const otherGangs = Object.keys(ns.gang.getOtherGangInformation()).filter(faction => faction !== gangJoined);
	const strength_level = 500;

	let c = 0;
	while (true) {
		// Check for recruits
		if (ns.gang.canRecruitMember()) {
			let name = 'gangsta-' + c;
			ns.gang.recruitMember(name);
			ns.gang.setMemberTask(name, 'Train Combat');
			c++;
		}
		// Get gang info
		const myGang = ns.gang.getGangInformation();
		const gangRoster = Array.from(ns.gang.getMemberNames(), (name) => ns.gang.getMemberInformation(name));
		//Update Log
		ns.clearLog();
		ns.print(`Gang: ${gangJoined}`);
		ns.print(`Gang Warfare: ${myGang.territoryWarfareEngaged}`);
		for (let gangMember of gangRoster) ns.print(`${gangMember.name} - ${gangMember.task}`);
		// Check for ascensions
		for (let gangMember of gangRoster) {
			if (!ns.gang.getAscensionResult(gangMember.name)) continue;
			if (ns.gang.getAscensionResult(gangMember.name).str >= asc_mult(gangMember)) ns.gang.ascendMember(gangMember.name);
		}
		// Check for equipment purchases
		purchaseEquipment(ns, gangRoster, strength_level);
		// Assign tasks
		let clashChance = Array.from(otherGangs, (faction) => ns.gang.getChanceToWinClash(faction));
		for (let gangMember of gangRoster) {
			if (gangMember.str < strength_level) ns.gang.setMemberTask(gangMember.name, 'Train Combat');
			else if (myGang.wantedPenalty < 0.05) ns.gang.setMemberTask(gangMember.name, 'Vigilante Justice');
			else if (gangRoster.length < 12) ns.gang.setMemberTask(gangMember.name, 'Terrorism');
			else if (clashChance.some(s => s < 0.8) && myGang.territory < 1) {
				ns.gang.setMemberTask(gangMember.name, 'Territory Warfare');
			} else ns.gang.setMemberTask(gangMember.name, 'Human Trafficking');
		}
		// Territory warfare checks
		if (clashChance.every(e => e > 0.8) && myGang.territory < 1) ns.gang.setTerritoryWarfare(true);
		else if (clashChance.some(s => s < 0.7) || myGang.territory === 1) ns.gang.setTerritoryWarfare(false);

		await ns.sleep(1000);
	}
}

function purchaseEquipment(ns, gangRoster, strength_level) {
	const strEquipment = ns.gang.getEquipmentNames().filter(equipment => ns.gang.getEquipmentStats(equipment).str).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	const defEquipment = ns.gang.getEquipmentNames().filter(equipment => ns.gang.getEquipmentStats(equipment).def).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	const dexEquipment = ns.gang.getEquipmentNames().filter(equipment => ns.gang.getEquipmentStats(equipment).dex).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	const agiEquipment = ns.gang.getEquipmentNames().filter(equipment => ns.gang.getEquipmentStats(equipment).agi).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	const orderedEquipment = [...new Set([...strEquipment, ...defEquipment, ...dexEquipment, ...agiEquipment])];
	for (let gangMember of gangRoster) {
		if (gangMember.str < strength_level) continue;
		for (let equipment of orderedEquipment) {
			if (!gangMember.upgrades.includes(equipment) && !ns.gang.purchaseEquipment(gangMember.name, equipment)) break;
		}
	}
}

function asc_mult(gangMember) {
	return Math.max(1.6 + (1 - gangMember.str_asc_mult) / 58, 1.1);
}