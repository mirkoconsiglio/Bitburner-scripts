import {copyScriptsToAll, getAccessibleServers, printBoth} from 'utils.js';
import {contractor} from 'contractor.js';
import {manageAndHack} from 'hack_manager.js';

// TODO: Automate working for Factions
//  Create program automator
//  Hacking Exp generator

export async function main(ns) {
	ns.disableLog('ALL');
	
	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);
	
	let contractorOnline = true;
	let declinedFactions = [];
	let usefulPrograms = ['BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe', 'HTTPWorm.exe', 'SQLInject.exe'];
	
	while (true) {
		let player = ns.getPlayer();
		
		// Heal player
		if (player.hp < player.max_hp) {
			let money = ns.nFormat(ns.hospitalize(), '0.000a');
			printBoth(ns, `Player hospitalized for ${money}`);
		}
		
		// Contract solver (disables itself if any solution was not correct)
		if (contractorOnline) contractorOnline = contractor(ns);
		
		// Purchase TOR
		if (ns.purchaseTor()) {
			printBoth(ns, `Purchased TOR.`);
		}
		// Purchase only useful programs
		if (player.tor) {
			for (let program of usefulPrograms) {
				if (!ns.fileExists(program)) {
					if (ns.purchaseProgram(program)) {
						printBoth(ns, `Purchased ${program}.`);
					}
				}
			}
		}
		
		// Upgrade home RAM
		if (ns.upgradeHomeRam()) {
			printBoth(ns, `Home RAM upgraded.`);
		}
		//Upgrade home cores
		if (ns.upgradeHomeCores()) {
			printBoth(ns, `Home cores upgraded.`);
		}
		
		// Backdoor servers
		for (let server of getAccessibleServers(ns)) {
			if (!(ns.getServer(server).backdoorInstalled ||
				server === 'home' ||
				ns.isRunning('backdoor.js', 'home', server))) {
				printBoth(ns, `Installing backdoor on ${server}.`);
				ns.exec('backdoor.js', 'home', 1, server);
			}
		}
		
		// Simple hack manager
		manageAndHack(ns);
		
		// Check faction invites
		let factions = ns.checkFactionInvitations();
		for (let faction of factions) {
			if (!declinedFactions.includes(faction)) {
				ns.print(`Request to join ${faction}.`);
				if (await ns.prompt(`Join ${faction}?`)) { // Ask to Join Faction
					ns.print(`Accepted to join ${faction}.`);
					ns.joinFaction(faction);
					ns.tprint(`Joined ${faction}.`);
				}
				else { // Don't ask again
					ns.print(`Refused to join ${faction}.`);
					declinedFactions.push(faction);
				}
			}
		}
		
		await ns.sleep(1000);
	}
}