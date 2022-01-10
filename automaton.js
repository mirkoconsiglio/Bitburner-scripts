import {manageAndHack} from '/hacking/hack-manager.js';
import {contractor} from '/utils/contractor.js';
import {copyScriptsToAll, getAccessibleServers, printBoth} from '/utils/utils.js';

// TODO: Create program automator
// TODO: Faction automator
// TODO: Crime automator
// TODO: Gym automator
// TODO: Hacking Exp generator

export async function main(ns) {
	ns.disableLog('ALL');

	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);

	let contractorOnline = true;
	const askedFactions = [];
	const usefulPrograms = [
		['BruteSSH.exe', 50],
		['FTPCrack.exe', 100],
		['relaySMTP.exe', 300],
		['HTTPWorm.exe', 400],
		['SQLInject.exe', 800]
	];

	while (true) {
		let player = ns.getPlayer();

		// Heal player
		if (player.hp < player.max_hp) {
			let money = ns.nFormat(ns.hospitalize(), '0.000a');
			printBoth(ns, `Player hospitalized for ${money}`);
		}

		// Contract solver (disables itself if any solution was incorrect)
		if (contractorOnline) contractorOnline = contractor(ns);

		// Purchase TOR
		if (ns.purchaseTor()) printBoth(ns, `Purchased TOR.`);
		// Purchase only useful programs
		if (player.tor) {
			for (let [program, hackingLevel] of usefulPrograms) {
				if (!ns.fileExists(program) && player.hacking >= hackingLevel) {
					if (ns.purchaseProgram(program)) printBoth(ns, `Purchased ${program}.`);
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
				ns.isRunning('/utils/backdoor.js', 'home', server))) {
				printBoth(ns, `Installing backdoor on ${server}.`);
				ns.exec('/utils/backdoor.js', 'home', 1, server);
			}
		}

		// Simple hack manager
		manageAndHack(ns);

		// Check faction invites
		let factions = ns.checkFactionInvitations();
		for (let faction of factions) {
			if (!askedFactions.includes(faction)) {
				ns.print(`Request to join ${faction}.`);
				ns.exec('/utils/join-faction.js', 'home', 1, faction)
				askedFactions.push(faction); // Don't ask again
			}
		}

		await ns.sleep(1000);
	}
}