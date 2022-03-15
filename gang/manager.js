import {
	ascendMembers,
	assignTasks,
	getGangName,
	purchaseEquipment,
	recruitGangMembers,
	territoryWarfare
} from 'gang/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	if (!ns.gang.inGang()) {
		ns.tprint(`You need to join a gang first`);
		return;
	}
	let counter = 0;
	// noinspection InfiniteLoopJS
	while (true) {
		// Check for recruits
		counter = recruitGangMembers(ns, counter);
		// Get gang info
		const gangRoster = Array.from(ns.gang.getMemberNames(), name => ns.gang.getMemberInformation(name));
		//Update Log
		ns.clearLog();
		ns.print(`Gang: ${getGangName(ns)}`);
		ns.print(`Gang Warfare: ${ns.gang.getGangInformation().territoryWarfareEngaged}`);
		for (const gangMember of gangRoster) ns.print(`${gangMember.name} - ${gangMember.task}`);
		// Check for ascensions
		ascendMembers(ns, gangRoster);
		// Check for equipment purchases
		purchaseEquipment(ns, gangRoster);
		// Assign tasks
		assignTasks(ns, gangRoster);
		// Check for territory warfare
		ns.gang.setTerritoryWarfare(territoryWarfare(ns));
		await ns.sleep(1000);
	}
}