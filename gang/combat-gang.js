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

	const str = 500;
	const str_mult = 1.5;
	const otherGangs = Object.keys(ns.gang.getOtherGangInformation()).filter(faction => faction !== gangJoined);

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
			if (ns.gang.getAscensionResult(gangMember.name).str > str_mult) ns.gang.ascendMember(gangMember.name);
		}
		// Check for equipment purchases
		for (let equipment of ns.gang.getEquipmentNames()) {
			for (let gangMember of gangRoster) {
				if (ns.gang.getEquipmentCost(equipment) <= ns.getServerMoneyAvailable('home') && gangMember.str >= str) {
					ns.gang.purchaseEquipment(gangMember.name, equipment);
				}
			}
		}
		// Assign tasks
		let clashChance = Array.from(otherGangs, (faction) => ns.gang.getChanceToWinClash(faction));
		for (let gangMember of gangRoster) {
			if (gangMember.str > 100 && gangRoster.length < 6) ns.gang.setMemberTask(gangMember.name, 'Mug People');
			else if (gangMember.str < 500) ns.gang.setMemberTask(gangMember.name, 'Train Combat');
			else if (myGang.wantedPenalty < 0.05) ns.gang.setMemberTask(gangMember.name, 'Vigilante Justice');
			else if (clashChance.some(s => s < 0.8) && myGang.territory !== 1 && gangRoster.length === 12) {
				ns.gang.setMemberTask(gangMember.name, 'Territory Warfare');
			} else ns.gang.setMemberTask(gangMember.name, 'Human Trafficking');
		}
		// Territory warfare checks
		if (clashChance.every(e => e > 0.7) && myGang.territory !== 1) ns.gang.setTerritoryWarfare(true);
		if (clashChance.some(s => s < 0.6 || myGang.territory === 1)) ns.gang.setTerritoryWarfare(false);

		await ns.sleep(1000);
	}
}