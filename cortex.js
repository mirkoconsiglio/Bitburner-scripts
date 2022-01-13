import {manageAndHack} from '/hacking/hack-manager.js';
import {contractor} from '/utils/contractor.js';
import {copyScriptsToAll, getAccessibleServers, printBoth} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');

	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);

	const promptTimer = 15 * 1000; // 15 seconds
	const upgradeRamTimer = 5 * 60 * 1000; // 5 minutes
	const upgradeCoresTimer = 5 * 60 * 1000; // 5 minutes
	const usefulPrograms = [
		['BruteSSH.exe', 50],
		['FTPCrack.exe', 100],
		['relaySMTP.exe', 300],
		['HTTPWorm.exe', 400],
		['SQLInject.exe', 800]
	];

	let contractorOnline = true;
	let askedFactions = [];
	let promptTime = ns.getTimeSinceLastAug();
	let upgradeRamTime = ns.getTimeSinceLastAug();
	let upgradeCoresTime = ns.getTimeSinceLastAug();

	while (true) {
		let player = ns.getPlayer();

		// Heal player
		if (player.hp < player.max_hp) {
			let cost = ns.hospitalize()
			printBoth(ns, `Player hospitalized for ${ns.nFormat(cost, '$0.000a')}`);
		}

		// Contract solver (disables itself if any solution was incorrect)
		if (contractorOnline) contractorOnline = contractor(ns);

		// Purchase TOR
		if (ns.purchaseTor()) printBoth(ns, `Purchased TOR router.`);
		// Purchase only useful programs
		if (player.tor) {
			for (let [program, hackingLevel] of usefulPrograms) {
				if (!ns.fileExists(program) && player.hacking >= hackingLevel) {
					if (ns.purchaseProgram(program)) printBoth(ns, `Purchased ${program}.`);
				}
			}
		}

		// Upgrade home RAM
		if (ns.getUpgradeHomeRamCost() <= ns.getServerMoneyAvailable('home') &&
			ns.getTimeSinceLastAug() - upgradeRamTime > upgradeRamTimer) {
			ns.exec('/utils/upgrade-home-ram.js', 'home', 1);
			upgradeRamTime = ns.getTimeSinceLastAug();
			promptTime = ns.getTimeSinceLastAug();
		}
		// Upgrade home cores
		if (ns.getUpgradeHomeCoresCost() <= ns.getServerMoneyAvailable('home') &&
			ns.getTimeSinceLastAug() - upgradeCoresTime > upgradeCoresTimer) {
			ns.exec('/utils/upgrade-home-cores.js', 'home', 1);
			upgradeCoresTime = ns.getTimeSinceLastAug();
			promptTime = ns.getTimeSinceLastAug();
		}

		// Backdoor servers
		for (let server of getAccessibleServers(ns)) {
			if (!(server === 'home' ||
				ns.getServer(server).backdoorInstalled ||
				ns.isRunning('/utils/backdoor.js', 'home', server))) {
				ns.print(`Installing backdoor on ${server}.`);
				ns.exec('/utils/backdoor.js', 'home', 1, server);
			}
		}

		// Simple hack manager
		manageAndHack(ns);

		// Check faction invites
		let factions = ns.checkFactionInvitations().filter(faction => !askedFactions.includes(faction));
		if (factions.length > 0) {
			ns.print(`Request to join ${factions}.`);
			ns.exec('/utils/join-factions.js', 'home', 1, ...factions);
			askedFactions = askedFactions.concat(factions); // Don't ask again
			promptTime = ns.getTimeSinceLastAug();
		}

		// Kill any prompt functions active for longer than 15 seconds
		if (ns.getTimeSinceLastAug() - promptTime > promptTimer) {
			ns.scriptKill('/utils/upgrade-home-ram.js', 'home');
			ns.scriptKill('/utils/upgrade-home-cores.js', 'home');
			ns.scriptKill('/utils/join-factions.js', 'home');
			promptTime = ns.getTimeSinceLastAug();
		}

		await ns.sleep(1000);
	}
}