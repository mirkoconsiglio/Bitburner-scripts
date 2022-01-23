export async function main(ns) {
	ns.disableLog('ALL')

	if (!ns.gang.inGang()) {
		ns.tprint(`You need to join a gang first.`);
		ns.exit();
	} else if (!ns.gang.getGangInformation().isHacking) {
		ns.tprint(`Not a hacking gang.`);
		ns.exit();
	}

	const gangJoined = ns.gang.getGangInformation().faction;
	const hack_level = 500;

	let c = 0;
	while (true) {
		// Check for recruits
		if (ns.gang.canRecruitMember()) {
			let name = 'hackerman-' + c;
			ns.gang.recruitMember(name);
			ns.gang.setMemberTask(name, 'Train Hacking');
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
			if (ns.gang.getAscensionResult(gangMember.name).hack >= asc_mult(gangMember)) ns.gang.ascendMember(gangMember.name);
		}
		// Check for equipment purchases
		for (let equipment of ns.gang.getEquipmentNames().filter(equipment => ns.gang.getEquipmentStats(equipment).hack)) {
			for (let gangMember of gangRoster) {
				if (ns.gang.getEquipmentCost(equipment) <= ns.getServerMoneyAvailable('home')) {
					ns.gang.purchaseEquipment(gangMember.name, equipment);
				}
			}
		}
		// Assign tasks
		for (let gangMember of gangRoster) {
			if (gangMember.hack < hack_level) ns.gang.setMemberTask(gangMember.name, 'Train Hacking');
			else if (myGang.wantedPenalty < 0.05) ns.gang.setMemberTask(gangMember.name, 'Ethical Hacking');
			else if (gangRoster.length < 12) ns.gang.setMemberTask(gangMember.name, 'Cyberterrorism');
			else ns.gang.setMemberTask(gangMember.name, 'Money Laundering');
		}

		await ns.sleep(1000);
	}
}

function asc_mult(gangMember) {
	return Math.max(1.6 + (1 - gangMember.hack_asc_mult) / 58, 1.1);
}