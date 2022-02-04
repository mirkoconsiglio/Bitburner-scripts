import {manageAndHack} from '/hacking/hack-manager.js';
import {contractor} from '/utils/contractor.js';
import {copyScriptsToAll, getAccessibleServers, printBoth, promptScriptRunning} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);
	// Constants
	const upgradeRamTimer = 5 * 60 * 1000; // 5 minutes
	const upgradeCoresTimer = 5 * 60 * 1000; // 5 minutes
	const usefulPrograms = [
		['BruteSSH.exe', 50],
		['FTPCrack.exe', 100],
		['relaySMTP.exe', 300],
		['HTTPWorm.exe', 400],
		['SQLInject.exe', 800]
	];
	// Variables
	let contractorOnline = true;
	let askedFactions = [];
	let upgradeRamTime = upgradeRamTimer;
	let upgradeCoresTime = upgradeCoresTimer;
	let player = ns.getPlayer();
	// Stock market manager
	if (player.has4SDataTixApi && !ns.isRunning('/stock-market/stock-market.js', 'home') &&
		await ns.prompt(`Start stock market manager?`)) {
		ns.exec('/stock-market/stock-market.js', 'home');
		printBoth(ns, `Started stock market manager`);
	}
	// Gang manager
	if ((player.bitNodeN === 2 || (ns.getOwnedSourceFiles().some(s => s.n === 2 && s.lvl >= 1) &&
		ns.heart.break() <= -54e3)) && ns.gang.inGang() && !(ns.isRunning('/gang/combat-gang.js', 'home') ||
		ns.isRunning('/gang/hacking-gang.js', 'home')) && await ns.prompt(`Start gang manager?`)) {
		if (ns.gang.getGangInformation().isHacking) ns.exec('/gang/hacking-gang.js', 'home');
		else ns.exec('/gang/combat-gang.js', 'home');
		printBoth(ns, `Started gang manager`);
	}
	// Corp manager
	if ((player.bitNodeN === 3 || ns.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3)) &&
		player.hasCorporation && !ns.isRunning('/corporation/autopilot.js', 'home') && await ns.prompt(`Start corp manager?`)) {
		ns.exec('/corporation/autopilot.js', 'home');
		printBoth(ns, `Started corp manager`);
	}
	// Bladeburner manager
	if ((player.bitNodeN === 7 || ns.getOwnedSourceFiles().some(s => s.n === 7 && s.lvl >= 1)) &&
		bb.joinBladeburnerDivision() && !ns.isRunning('/bladeburner/autopilot.js', 'home') &&
		await ns.prompt(`Start bladeburner manager?`)) {
		ns.exec('/bladeburner/autopilot.js', 'home');
		printBoth(ns, `Started bladeburner manager`);
	}
	// Sleeve manager
	if ((player.bitNodeN === 10 || ns.getOwnedSourceFiles().some(s => s.n === 10 && s.lvl >= 1))
		&& !ns.isRunning('/sleeve/autopilot.js', 'home') && await ns.prompt(`Start sleeve manager?`)) {
		ns.exec('/sleeve/autopilot.js', 'home');
		printBoth(ns, `Started sleeve manager`);
	}
	// Cortex
	while (true) {
		player = ns.getPlayer();
		// UI
		if (!ns.isRunning('/ui/overview.js')) ns.exec('/ui/overview.js', 'home');
		// Heal player
		if (player.hp < player.max_hp) {
			let cost = ns.hospitalize();
			printBoth(ns, `Player hospitalized for ${ns.nFormat(cost, '$0.000a')}`);
		}
		// Contract solver (disables itself if any solution was incorrect)
		if (contractorOnline) contractorOnline = contractor(ns);
		// Purchase TOR
		if (ns.purchaseTor()) printBoth(ns, `Purchased TOR router`);
		// Purchase only useful programs
		if (player.tor) {
			for (let [program, hackingLevel] of usefulPrograms) {
				if (!ns.fileExists(program) && player.hacking >= hackingLevel) {
					if (ns.purchaseProgram(program)) printBoth(ns, `Purchased ${program}`);
				}
			}
		}
		// Upgrade home RAM
		if (ns.getUpgradeHomeRamCost() <= ns.getServerMoneyAvailable('home') &&
			ns.getTimeSinceLastAug() - upgradeRamTime > upgradeRamTimer &&
			!promptScriptRunning(ns, 'home') && ns.getServerMaxRam('home') < 2 ** 30) {
			ns.exec('/utils/upgrade-home-ram.js', 'home', 1);
			upgradeRamTime = ns.getTimeSinceLastAug();
		}
		// Upgrade home cores
		if (ns.getUpgradeHomeCoresCost() <= ns.getServerMoneyAvailable('home') &&
			ns.getTimeSinceLastAug() - upgradeCoresTime > upgradeCoresTimer &&
			!promptScriptRunning(ns, 'home') && ns.getServer('home').cpuCores < 8) {
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