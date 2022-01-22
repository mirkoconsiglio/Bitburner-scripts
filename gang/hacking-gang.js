export async function main(ns) {
	ns.disableLog('ALL')

	let gangJoined;
	if (!ns.gang.inGang()) {
		if (!ns.args[0]) {
			ns.tprint(`You need to specify a gang to join.`);
			ns.exit();
		}
		if (!ns.gang.createGang(ns.args[0])) {
			ns.tprint(`Failed to join ${ns.args[0]}.`);
			ns.exit();
		}
		ns.tprint(`Joined ${ns.args[0]}.`);
		gangJoined = ns.args[0];
	} else gangJoined = ns.gang.getGangInformation().faction;

	const earlyHack = 50;
	const lateHack = 500;

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
				if (ns.gang.getEquipmentCost(equipment) <= ns.getServerMoneyAvailable('home') && gangMember.hack >= lateHack) {
					ns.gang.purchaseEquipment(gangMember.name, equipment);
				}
			}
		}
		// Assign tasks
		for (let gangMember of gangRoster) {
			if (gangMember.hack >= earlyHack && gangRoster.length <= 6) ns.gang.setMemberTask(gangMember.name, 'Ransomware');
			else if (gangMember.hack < lateHack) ns.gang.setMemberTask(gangMember.name, 'Train Hacking');
			else if (myGang.wantedPenalty < 0.05) ns.gang.setMemberTask(gangMember.name, 'Ethical Hacking');
			else ns.gang.setMemberTask(gangMember.name, 'Money Laundering');
		}

		await ns.sleep(1000);
	}
}

function asc_mult(gangMember) {
	return Math.max(1.6 + (1 - gangMember.hack_asc_mult) / 58, 1.1);
}