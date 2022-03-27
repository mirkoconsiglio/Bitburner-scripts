import {getFactionWorktypes} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	while (true) {
		let factions = ns.getPlayer().factions.filter(f => f !== 'Church of the Machine God' && f !== 'Bladeburner');
		if (ns.gang.inGang()) factions = factions.filter(f => ns.gang.getGangInformation().faction !== f);
		const faction = await ns.prompt(`Work for faction?`, {type: 'select', choices: ['None', ...factions]});
		if (faction === 'None') break;
		const worktype = await ns.prompt(`Type of Work?`, {type: 'select', choices: getFactionWorktypes(faction)});
		const rep = Number(await ns.prompt(`Work until how much reputation? (Leave empty to work indefinitely)`, {type: 'text'}));
		if (!rep) {
			ns.workForFaction(faction, worktype, ns.isFocused());
			break;
		}
		while (ns.getFactionRep(faction) < rep) {
			ns.workForFaction(faction, worktype, ns.isFocused());
			await ns.sleep(1000);
		}
	}
}