import {manageAndHack} from '/hacking/hack-manager.js';
import {contractor} from '/utils/contractor.js';
import {copyScriptsToAll, getAccessibleServers, printBoth, promptScriptRunning} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');

	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);

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
	let upgradeRamTime = upgradeRamTimer;
	let upgradeCoresTime = upgradeCoresTimer;

	while (true) {
		let player = ns.getPlayer();

		// Heal player
		if (player.hp < player.max_hp) {
			let cost = ns.hospitalize()
			printBoth(ns, `Player hospitalized for ${ns.nFormat(cost, '$0.000a')}`);
		}

		// Contract solver (disables itself if any solution was incorrect)
		if (contractorOnline) contractorOnline = contractor(ns);

		// Stock market
		if (ns.getPlayer().has4SDataTixApi && !ns.isRunning('/stock-market/stock-market.js', 'home')) {
			ns.exec('/stock-market/stock-market.js', 'home');
		}

		// Gang manager
		if ((ns.getPlayer().bitNodeN === 2 || (ns.getOwnedSourceFiles().some(s => s.n === 2 && s.lvl >= 1) &&
			ns.heart.break() <= -54e3)) && ns.gang.inGang() && !(ns.isRunning('/gang/combat-gang', 'home') ||
			ns.isRunning('/gang/hacking-gang', 'home'))) {
			if (ns.gang.getGangInformation().isHacking) ns.exec('/gang/hacking-gang.js', 'home');
			else ns.exec('/gang/combat-gang.js', 'home');
			ns.print(`Started gang manager`);
		}

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
			ns.getTimeSinceLastAug() - upgradeRamTime > upgradeRamTimer &&
			!promptScriptRunning(ns, 'home')) {
			ns.exec('/utils/upgrade-home-ram.js', 'home', 1);
			upgradeRamTime = ns.getTimeSinceLastAug();
		}
		// Upgrade home cores
		if (ns.getUpgradeHomeCoresCost() <= ns.getServerMoneyAvailable('home') &&
			ns.getTimeSinceLastAug() - upgradeCoresTime > upgradeCoresTimer &&
			!promptScriptRunning(ns, 'home')) {
			ns.exec('/utils/upgrade-home-cores.js', 'home', 1);
			upgradeCoresTime = ns.getTimeSinceLastAug();
		}

		// Backdoor servers
		for (let server of getAccessibleServers(ns)) {
			if (!(server === 'home' || server === 'w0r1d_d43m0n' ||
				ns.getServer(server).backdoorInstalled ||
				ns.isRunning('/utils/backdoor.js', 'home', server))) {
				ns.print(`Installing backdoor on ${server}`);
				ns.exec('/utils/backdoor.js', 'home', 1, server);
			}
		}

		// Simple hack manager
		manageAndHack(ns);

		// Check faction invites
		let factions = ns.checkFactionInvitations().filter(faction => !askedFactions.includes(faction));
		if (factions.length > 0 && !promptScriptRunning(ns, 'home')) {
			ns.print(`Request to join ${factions}`);
			ns.exec('/utils/join-factions.js', 'home', 1, ...factions);
			askedFactions = askedFactions.concat(factions); // Don't ask again
		}

		await ns.sleep(1000);
	}
}