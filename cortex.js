// noinspection JSUnresolvedVariable

import {contractor} from '/contracts/contractor.js';
import {manageAndHack} from '/hacking/controller.js';
import {deployDaemons} from '/hacking/deploy-daemons.js';
import {spendHashes} from '/hacknet/hash-spender.js';
import {updateOverview} from '/ui/overview.js';
import {
	copyScriptsToAll,
	enoughRam,
	getAccessibleServers,
	getScripts,
	getUsefulPrograms,
	printBoth,
	promptScriptRunning
} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);
	const scripts = getScripts();
	// Variables
	const vars = {
		host: ns.getHostname(),
		haveHacknetServers: ns.getPlayer().bitNodeN === 9 || ns.getOwnedSourceFiles().some(s => s.n === 9),
		contractor: true,
		upgradeRam: true,
		upgradeCores: true,
		ram: ns.getServerMaxRam('home'),
		cores: ns.getServer('home').cpuCores,
		gang: false,
		corp: false,
		bladeburner: false,
		stock: false,
		hacknet: false,
		sleeve: false,
		stanek: false,
		backdoorWorldDaemon: false,
		factions: []
	};
	// noinspection InfiniteLoopJS
	while (true) {
		const player = ns.getPlayer();
		// Heal player
		if (player.hp < player.max_hp) {
			let cost = ns.hospitalize();
			ns.print(`Player hospitalized for ${ns.nFormat(cost, '$0.000a')}`);
		}
		// Contract solver (disables itself if any solution was incorrect)
		if (vars.contractor) vars.contractor = contractor(ns);
		// Purchase TOR
		if (ns.purchaseTor()) printBoth(ns, `Purchased TOR router`);
		// Purchase only useful programs
		if (player.tor) {
			for (let program of getUsefulPrograms()) {
				if (!ns.fileExists(program.name) && player.hacking >= program.level) {
					if (ns.purchaseProgram(program.name)) printBoth(ns, `Purchased ${program.name}`);
				}
			}
		}
		// Check if we want to upgrade home server
		const homeServer = ns.getServer('home');
		const ram = homeServer.maxRam;
		const cores = homeServer.cpuCores;
		if (ram > vars.ram) {
			vars.ram = ram;
			vars.upgradeRam = true;
		}
		if (cores > vars.cores) {
			vars.cores = cores;
			vars.upgradeCores = true;
		}
		// Upgrade home RAM
		if (ns.getUpgradeHomeRamCost() <= player.money && vars.upgradeRam &&
			!promptScriptRunning(ns, vars.host) && ram < 2 ** 30) {
			ns.exec(scripts.upgradeHomeRam, vars.host);
			vars.upgradeRam = false;
		}
		// Upgrade home cores
		if (ns.getUpgradeHomeCoresCost() <= player.money && vars.upgradeCores &&
			!promptScriptRunning(ns, vars.host) && cores < 8) {
			ns.exec(scripts.upgradeHomeCores, vars.host);
			vars.upgradeCores = false;
		}
		// Gang manager
		// noinspection JSUnresolvedFunction
		if ((player.bitNodeN === 2 || (ns.getOwnedSourceFiles().some(s => s.n === 2) && ns.heart.break() <= -54e3)) &&
			ns.gang.inGang() && !ns.isRunning(scripts.gang, vars.host) && !vars.gang &&
			enoughRam(ns, scripts.gang, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start gang manager?`)) {
				ns.exec(scripts.gang, vars.host);
				printBoth(ns, `Started gang manager`);
			}
			vars.gang = true;
		}
		// Corp manager
		if ((player.bitNodeN === 3 || ns.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3)) &&
			player.hasCorporation && !ns.isRunning(scripts.corp, vars.host) && !vars.corp &&
			enoughRam(ns, scripts.corp, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start corp manager?`)) {
				ns.exec(scripts.corp, vars.host);
				printBoth(ns, `Started corp manager`);
			}
			vars.corp = true;
		}
		// Bladeburner manager
		if ((player.bitNodeN === 7 || ns.getOwnedSourceFiles().some(s => s.n === 7)) &&
			ns.bladeburner.joinBladeburnerDivision() && !ns.isRunning(scripts.bladeburner, vars.host) &&
			!vars.bladeburner && enoughRam(ns, scripts.bladeburner, vars.host) &&
			!promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start Bladeburner manager?`)) {
				ns.exec(scripts.bladeburner, vars.host);
				printBoth(ns, `Started Bladeburner manager`);
			}
			vars.bladeburner = true;
		}
		// Stock market manager
		if (player.hasTixApiAccess && !ns.isRunning(scripts.stock, vars.host) && !vars.stock &&
			enoughRam(ns, scripts.stock, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start stock market manager?`)) {
				ns.exec(scripts.stock, vars.host);
				printBoth(ns, `Started stock market manager`);
			}
			vars.stock = true;
		}
		// Hacknet manager
		if (!ns.isRunning(scripts.hacknet, vars.host) && !vars.hacknet &&
			enoughRam(ns, scripts.hacknet, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start Hacknet manager?`)) {
				ns.exec(scripts.hacknet, vars.host);
				printBoth(ns, `Started Hacknet manager`);
			}
			vars.hacknet = true;
		}
		// Sleeve manager
		if ((player.bitNodeN === 10 || ns.getOwnedSourceFiles().some(s => s.n === 10)) &&
			!ns.isRunning(scripts.sleeve, vars.host) && !vars.sleeve &&
			enoughRam(ns, scripts.sleeve, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start sleeve manager?`)) {
				ns.exec(scripts.sleeve, vars.host);
				printBoth(ns, `Started sleeve manager`);
			}
			vars.sleeve = true;
		}
		// Stanek Manager
		if ((player.bitNodeN === 13 || ns.getOwnedSourceFiles().some(s => s.n === 13)) &&
			!ns.isRunning(scripts.stanek, vars.host) && !vars.stanek &&
			enoughRam(ns, scripts.stanek, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start Stanek's Gift manager?`)) {
				ns.exec(scripts.stanek, vars.host);
				printBoth(ns, `Started Stanek's Gift manager`);
			}
			vars.stanek = true;
		}
		// Check faction invites
		let factions = ns.checkFactionInvitations().filter(faction => !vars.factions.includes(faction));
		if (factions.length > 0 && enoughRam(ns, scripts.joinFactions, vars.host) &&
			!promptScriptRunning(ns, vars.host)) {
			ns.print(`Request to join ${factions}`);
			ns.exec(scripts.joinFactions, vars.host, 1, ...factions);
			vars.factions = vars.factions.concat(factions); // Don't ask again
		}
		// Backdoor servers
		for (let server of getAccessibleServers(ns)) {
			if (!ns.getServer(server).backdoorInstalled &&
				!ns.isRunning(scripts.backdoor, vars.host, server) &&
				server !== 'home') {
				if (server === 'w0r1d_d43m0n' && !vars.backdoorWorldDaemon) {
					if (await ns.prompt(`Install backdoor on w0r1d_d43m0n and finish Bitnode?`)) {
						ns.print(`Installing backdoor on ${server}`);
						ns.exec(scripts.backdoor, vars.host, 1, server);
					}
					vars.backdoorWorldDaemon = true;
				} else {
					ns.print(`Installing backdoor on ${server}`);
					ns.exec(scripts.backdoor, vars.host, 1, server);
				}
			}
		}
		// Spend Hashes
		if (vars.haveHacknetServers) await spendHashes(ns, 'Sell for Money');
		// Deploy daemons
		deployDaemons(ns);
		// Simple hack manager
		manageAndHack(ns);
		// Update overview
		updateOverview(ns);
		// Update every second
		await ns.sleep(1000);
	}
}