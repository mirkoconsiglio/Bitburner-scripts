import {manageAndHack} from '/hacking/hack-manager.js';
import {contractor} from '/utils/contractor.js';
import {
	copyScriptsToAll,
	enoughRam,
	getAccessibleServers,
	getScripts,
	printBoth,
	promptScriptRunning
} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);
	// Constants
	const host = ns.getHostname();
	const scripts = getScripts();
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
	let askedUI = false;
	let askedStock = false;
	let askedGang = false;
	let askedCorp = false;
	let askedBladeburner = false;
	let askedSleeve = false;
	let askedFactions = [];
	let upgradeRamTime = upgradeRamTimer;
	let upgradeCoresTime = upgradeCoresTimer;
	// Cortex
	while (true) {
		const player = ns.getPlayer();
		// Heal player
		if (player.hp < player.max_hp) {
			let cost = ns.hospitalize();
			ns.print(`Player hospitalized for ${ns.nFormat(cost, '$0.000a')}`);
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
		// Backdoor servers
		for (let server of getAccessibleServers(ns)) {
			if (!(server === 'home' || server === 'w0r1d_d43m0n' ||
				ns.getServer(server).backdoorInstalled ||
				ns.isRunning(scripts.backdoor, host, server))) {
				ns.print(`Installing backdoor on ${server}`);
				ns.exec(scripts.backdoor, host, 1, server);
			}
		}
		// Deploy daemons if home RAM >= 4 TiB
		if (ns.getServerMaxRam('home') >= 2 ** 12 &&
			enoughRam(ns, scripts.deployDaemons, host)) ns.exec(scripts.deployDaemons, host);
		// Simple hack manager
		manageAndHack(ns);
		// Upgrade home RAM
		if (ns.getUpgradeHomeRamCost() <= player.money &&
			ns.getTimeSinceLastAug() - upgradeRamTime > upgradeRamTimer &&
			!promptScriptRunning(ns, host) && ns.getServerMaxRam('home') < 2 ** 30) {
			ns.exec(scripts.upgradeHomeRam, host, 1);
			upgradeRamTime = ns.getTimeSinceLastAug();
		}
		// Upgrade home cores
		if (ns.getUpgradeHomeCoresCost() <= player.money &&
			ns.getTimeSinceLastAug() - upgradeCoresTime > upgradeCoresTimer &&
			!promptScriptRunning(ns, host) && ns.getServer('home').cpuCores < 8) {
			ns.exec(scripts.upgradeHomeCores, host, 1);
			upgradeCoresTime = ns.getTimeSinceLastAug();
		}
		// UI
		if (!ns.isRunning(scripts.ui) && enoughRam(ns, scripts.ui, host) &&
			!promptScriptRunning(ns, host) && !askedUI) {
			if (await ns.prompt(`Start UI manager?`)) ns.exec(scripts.ui, host);
			askedUI = true;
		}
		// Stock market manager
		if (player.hasTixApiAccess && !ns.isRunning(scripts.stock, host) && !askedStock &&
			enoughRam(ns, scripts.stock, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start stock market manager?`)) {
				ns.exec(scripts.stock, host);
				printBoth(ns, `Started stock market manager`);
			}
			askedStock = true;
		}
		// Gang manager
		if ((player.bitNodeN === 2 || (ns.getOwnedSourceFiles().some(s => s.n === 2 && s.lvl >= 1) &&
			ns.heart.break() <= -54e3)) && ns.gang.inGang() && !askedGang && !promptScriptRunning(ns, host)) {
			if (ns.gang.getGangInformation().isHacking) {
				if (!ns.isRunning(scripts.hackingGang, host) && enoughRam(ns, scripts.hackingGang, host) &&
					await ns.prompt(`Start hacking gang manager?`)) {
					ns.exec(scripts.hackingGang, host);
					printBoth(ns, `Started hacking gang manager`);
				}
			} else {
				if (!ns.isRunning(scripts.combatGang, host) && enoughRam(ns, scripts.combatGang, host) &&
					await ns.prompt(`Start combat gang manager?`)) {
					ns.exec(scripts.combatGang, host);
					printBoth(ns, `Started combat gang manager`);
				}
			}
			askedGang = true;
		}
		// Corp manager
		if ((player.bitNodeN === 3 || ns.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3)) &&
			player.hasCorporation && !ns.isRunning(scripts.corp, host) && !askedCorp &&
			enoughRam(ns, scripts.corp, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start corp manager?`)) {
				ns.exec(scripts.corp, host);
				printBoth(ns, `Started corp manager`);
			}
			askedCorp = true;
		}
		// Bladeburner manager
		if ((player.bitNodeN === 7 || ns.getOwnedSourceFiles().some(s => s.n === 7 && s.lvl >= 1)) &&
			ns.bladeburner.joinBladeburnerDivision() && !askedBladeburner &&
			!ns.isRunning(scripts.bladeburner, host) && enoughRam(ns, scripts.bladeburner, host) &&
			!promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start bladeburner manager?`)) {
				ns.exec(scripts.bladeburner, host);
				printBoth(ns, `Started bladeburner manager`);
			}
			askedBladeburner = true;
		}
		// Sleeve manager
		if ((player.bitNodeN === 10 || ns.getOwnedSourceFiles().some(s => s.n === 10 && s.lvl >= 1)) &&
			!askedSleeve && !ns.isRunning(scripts.sleeve, host) &&
			enoughRam(ns, scripts.sleeve, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start sleeve manager?`)) {
				ns.exec(scripts.sleeve, host);
				printBoth(ns, `Started sleeve manager`);
			}
			askedSleeve = true;
		}
		// Check faction invites
		let factions = ns.checkFactionInvitations().filter(faction => !askedFactions.includes(faction));
		if (factions.length > 0 && enoughRam(ns, scripts.joinFactions, host) &&
			!promptScriptRunning(ns, host)) {
			ns.print(`Request to join ${factions}`);
			ns.exec(scripts.joinFactions, host, 1, ...factions);
			askedFactions = askedFactions.concat(factions); // Don't ask again
		}
		// Update every second
		await ns.sleep(1000);
	}
}