// noinspection JSUnresolvedVariable

import {contractor} from '/contracts/contractor.js';
import {spendHashes} from '/hacknet/hash-spender.js';
import {
	copyScriptsToAll,
	deployBatchers,
	enoughRam,
	getAccessibleServers,
	getGangs,
	getScripts,
	getUsefulPrograms,
	manageAndHack,
	printBoth,
	promptScriptRunning,
	updateOverview
} from '/utils.js';

// TODO: purchase WSE account and TIX API
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
		gang: true,
		corp: true,
		bladeburner: true,
		stock: true,
		hacknet: true,
		sleeve: true,
		stanek: true,
		backdoorWorldDaemon: true,
		factions: []
	};
	// noinspection InfiniteLoopJS
	while (true) {
		// Heal player
		if (ns.getPlayer().hp < ns.getPlayer().max_hp) {
			let cost = ns.hospitalize();
			ns.print(`Player hospitalized for ${ns.nFormat(cost, '$0.000a')}`);
		}
		// Contract solver (disables itself if any solution was incorrect)
		if (vars.contractor) vars.contractor = contractor(ns);
		// Purchase TOR
		if (ns.purchaseTor()) printBoth(ns, `Purchased TOR router`);
		// Purchase only useful programs
		if (ns.getPlayer().tor) {
			for (let program of getUsefulPrograms()) {
				if (!ns.fileExists(program.name) && ns.getPlayer().hacking >= program.level) {
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
		if (ns.getUpgradeHomeRamCost() <= ns.getPlayer().money && vars.upgradeRam &&
			!promptScriptRunning(ns, vars.host) && ram < 2 ** 30) {
			ns.exec(scripts.upgradeHomeRam, vars.host);
			vars.upgradeRam = false;
		}
		// Upgrade home cores
		if (ns.getUpgradeHomeCoresCost() <= ns.getPlayer().money && vars.upgradeCores &&
			!promptScriptRunning(ns, vars.host) && cores < 8) {
			ns.exec(scripts.upgradeHomeCores, vars.host);
			vars.upgradeCores = false;
		}
		// Purchase WSE account
		// Gang manager
		// noinspection JSUnresolvedFunction
		const hasGangs = ns.getPlayer().bitNodeN === 2 || (ns.getOwnedSourceFiles().some(s => s.n === 2) && ns.heart.break() <= -54e3);
		if (hasGangs && !ns.gang.inGang() && vars.gang && !ns.isRunning(scripts.gang, vars.host) &&
			!promptScriptRunning(ns, vars.host)) {
			const gangs = getGangs().filter(g => ns.getPlayer().factions.includes(g));
			gangs.push('No');
			const gang = await ns.prompt(`Create a gang?`, {'type': 'select', 'choices': gangs});
			if (gang !== 'No') {
				ns.gang.createGang(gang);
				printBoth(ns, `Created a gang with ${gang}`);
			} else vars.gang = false;
		}
		if (hasGangs && ns.gang.inGang() && vars.gang && !ns.isRunning(scripts.gang, vars.host) &&
			enoughRam(ns, scripts.gang, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start gang manager?`)) {
				ns.exec(scripts.gang, vars.host);
				printBoth(ns, `Started gang manager`);
			}
			vars.gang = false;
		}
		// Corp manager
		const hasCorps = ns.getPlayer().bitNodeN === 3 || ns.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3);
		if (hasCorps && !ns.getPlayer().hasCorporation && ns.getPlayer().money >= 150e9 && vars.corp
			&& !ns.isRunning(scripts.corp, vars.host) && !promptScriptRunning(ns, vars.host)) {
			const name = await ns.prompt(`Create a Corporation? (Leave empty if no)`, {'type': 'text'});
			if (name !== '') {
				const corp = eval('ns.corporation'); // Cheating here because using 1 TiB of RAM to start a corporation is overkill
				corp.createCorporation(name);
				printBoth(ns, `Started a corporation: ${name}`);
			} else vars.corp = false;
		}
		if (hasCorps && ns.getPlayer().hasCorporation && vars.corp && !ns.isRunning(scripts.corp, vars.host) &&
			enoughRam(ns, scripts.corp, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start corp manager?`)) {
				ns.exec(scripts.corp, vars.host);
				printBoth(ns, `Started corp manager`);
			}
			vars.corp = false;
		}
		// Bladeburner manager
		const hasBladeburner = ns.getPlayer().bitNodeN === 7 || ns.getOwnedSourceFiles().some(s => s.n === 7);
		if (hasBladeburner && !ns.getPlayer().inBladeburner && vars.bladeburner &&
			!ns.isRunning(scripts.bladeburner, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Join Bladeburner Division?`)) {
				ns.bladeburner.joinBladeburnerDivision();
				printBoth(ns, `Joined Bladeburner Division`);
			} else vars.bladeburner = false;
		}
		if (hasBladeburner && ns.getPlayer().inBladeburner && vars.bladeburner && !ns.isRunning(scripts.bladeburner, vars.host) &&
			enoughRam(ns, scripts.bladeburner, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start Bladeburner manager?`)) {
				ns.exec(scripts.bladeburner, vars.host);
				printBoth(ns, `Started Bladeburner manager`);
			}
			vars.bladeburner = false;
		}
		// Stock market manager
		if (ns.getPlayer().hasTixApiAccess && vars.stock && !ns.isRunning(scripts.stock, vars.host) &&
			enoughRam(ns, scripts.stock, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start stock market manager?`)) {
				ns.exec(scripts.stock, vars.host);
				printBoth(ns, `Started stock market manager`);
			}
			vars.stock = false;
		}
		// Hacknet manager
		if (vars.hacknet && !ns.isRunning(scripts.hacknet, vars.host) &&
			enoughRam(ns, scripts.hacknet, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start Hacknet manager?`)) {
				ns.exec(scripts.hacknet, vars.host);
				printBoth(ns, `Started Hacknet manager`);
			}
			vars.hacknet = false;
		}
		// Sleeve manager
		if ((ns.getPlayer().bitNodeN === 10 || ns.getOwnedSourceFiles().some(s => s.n === 10)) &&
			vars.sleeve && !ns.isRunning(scripts.sleeve, vars.host) &&
			enoughRam(ns, scripts.sleeve, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start sleeve manager?`)) {
				ns.exec(scripts.sleeve, vars.host);
				printBoth(ns, `Started sleeve manager`);
			}
			vars.sleeve = false;
		}
		// Stanek Manager
		const hasStanek = ns.getPlayer().bitNodeN === 13 || ns.getOwnedSourceFiles().some(s => s.n === 13);
		if (hasStanek && ns.getOwnedAugmentations().findIndex(e => e.includes('Stanek\'s Gift')) === -1 &&
			ns.getPlayer().money >= 200e3 && vars.stanek && !ns.isRunning(scripts.stanek, vars.host) &&
			!promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Accept Stanek's Gift?`)) {
				acceptStanek(ns);
				printBoth(ns, `Accepted Stanek's Gift`);
			} else vars.stanek = false;
		}
		if (hasStanek && ns.getOwnedAugmentations().findIndex(e => e.includes('Stanek\'s Gift')) !== -1 &&
			!ns.isRunning(scripts.stanek, vars.host) && vars.stanek &&
			enoughRam(ns, scripts.stanek, vars.host) && !promptScriptRunning(ns, vars.host)) {
			if (await ns.prompt(`Start Stanek's Gift manager?`)) {
				ns.exec(scripts.stanek, vars.host);
				printBoth(ns, `Started Stanek's Gift manager`);
			}
			vars.stanek = false;
		}
		// Check faction invites
		let factions = ns.checkFactionInvitations().filter(faction => vars.factions.includes(faction));
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
				if (server === 'w0r1d_d43m0n' && vars.backdoorWorldDaemon) {
					if (await ns.prompt(`Install backdoor on w0r1d_d43m0n and finish Bitnode?`)) {
						ns.print(`Installing backdoor on ${server}`);
						ns.exec(scripts.backdoor, vars.host, 1, server);
					}
					vars.backdoorWorldDaemon = false;
				} else {
					ns.print(`Installing backdoor on ${server}`);
					ns.exec(scripts.backdoor, vars.host, 1, server);
				}
			}
		}
		// Spend Hashes
		if (vars.haveHacknetServers) await spendHashes(ns, 'Sell for Money');
		// Deploy daemons
		deployBatchers(ns);
		// Simple hack manager
		manageAndHack(ns);
		// Update overview
		updateOverview(ns);
		// Update every second
		await ns.sleep(1000);
	}
}

/**
 *
 * @param {NS} ns
 */
function acceptStanek(ns) {
	ns.travelToCity('Chongqing');
	ns.goToLocation('Church of the Machine God');
	[...eval('document').getElementsByTagName('*')].find(e => e.innerText === 'Accept Stanek\'s Gift').click();
}