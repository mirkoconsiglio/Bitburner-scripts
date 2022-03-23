// noinspection JSUnresolvedVariable

import {contractor} from '/contracts/contractor.js';
import {spendHashes} from '/hacknet/hash-spender.js';
import {acceptStanek} from '/stanek/accept.js';
import {
	copyScriptsToAll,
	deployBatchers,
	enoughRam,
	getAccessibleServers,
	getGangs,
	getScripts,
	getUsefulPrograms,
	initData,
	manageAndHack,
	printBoth,
	promptScriptRunning,
	updateOverview
} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	// Copy necessary scripts to all servers
	await copyScriptsToAll(ns);
	// Initialise data
	await initData(ns);
	// Constants
	const scripts = getScripts();
	const haveHacknetServers = ns.getPlayer().bitNodeN === 9 || ns.getOwnedSourceFiles().some(s => s.n === 9);
	// Variables
	let host = ns.getHostname();
	let contractorOnline = true;
	let upgradeRam = true;
	let upgradeCores = true;
	let homeRam = ns.getServerMaxRam('home');
	let homeCores = ns.getServer('home').cpuCores;
	let wse = true;
	let tix = true;
	let gang = true;
	let corp = true;
	let bladeburner = true;
	let stock = true;
	let hacknet = true;
	let sleeve = true;
	let stanek = true;
	let backdoorWorldDaemon = true;
	let factions = [];
	// noinspection InfiniteLoopJS
	while (true) {
		// Heal player
		if (ns.getPlayer().hp < ns.getPlayer().max_hp) {
			let cost = ns.hospitalize();
			ns.print(`Player hospitalized for ${ns.nFormat(cost, '$0.000a')}`);
		}
		// Contract solver (disables itself if any solution was incorrect)
		if (contractorOnline) contractorOnline = contractor(ns);
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
		const currentHomeRam = homeServer.maxRam;
		const currentHomeCores = homeServer.cpuCores;
		if (currentHomeRam > homeRam) {
			homeRam = currentHomeRam;
			upgradeRam = true;
		}
		if (currentHomeCores > homeCores) {
			homeCores = currentHomeCores;
			upgradeCores = true;
		}
		// Upgrade home RAM
		if (ns.getPlayer().money >= ns.getUpgradeHomeRamCost() && upgradeRam &&
			!promptScriptRunning(ns, host) && homeRam < 2 ** 30) {
			ns.exec(scripts.upgradeHomeRam, host);
			upgradeRam = false;
		}
		// Upgrade home cores
		if (ns.getPlayer().money >= ns.getUpgradeHomeCoresCost() && upgradeCores &&
			!promptScriptRunning(ns, host) && homeCores < 8) {
			ns.exec(scripts.upgradeHomeCores, host);
			upgradeCores = false;
		}
		// Purchase WSE account
		if (!ns.getPlayer().hasWseAccount && ns.getPlayer().money >= 200e6 && wse &&
			!promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Purchase WSE account?`)) {
				ns.stock.purchaseWseAccount();
				printBoth(ns, `Purchased WSE account`);
			} else wse = false;
		}
		// Purchase TIX API
		if (!ns.getPlayer().hasTixApiAccess && ns.getPlayer().money >= 5e9 && tix &&
			!promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Purchase TIX API?`)) {
				ns.stock.purchaseTixApi();
				printBoth(ns, `Purchased TIX API`);
			} else tix = false;
		}
		// Gang manager
		// noinspection JSUnresolvedFunction
		const hasGangs = ns.getPlayer().bitNodeN === 2 || (ns.getOwnedSourceFiles().some(s => s.n === 2) && ns.heart.break() <= -54e3);
		if (hasGangs && !ns.gang.inGang() && gang && !ns.isRunning(scripts.gang, host) &&
			!promptScriptRunning(ns, host)) {
			const gangs = getGangs().filter(g => ns.getPlayer().factions.includes(g));
			gangs.push('No');
			const gangName = await ns.prompt(`Create a gang?`, {'type': 'select', 'choices': gangs});
			if (gangName !== 'No') {
				ns.gang.createGang(gangName);
				printBoth(ns, `Created a gang with ${gangName}`);
			} else gang = false;
		}
		if (hasGangs && ns.gang.inGang() && gang && !ns.isRunning(scripts.gang, host) &&
			enoughRam(ns, scripts.gang, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start gang manager?`)) {
				ns.exec(scripts.gang, host);
				printBoth(ns, `Started gang manager`);
			}
			gang = false;
		}
		// Corp manager
		const hasCorps = ns.getPlayer().bitNodeN === 3 || ns.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3);
		if (hasCorps && !ns.getPlayer().hasCorporation && ns.getPlayer().money >= 150e9 && corp
			&& !ns.isRunning(scripts.corp, host) && !promptScriptRunning(ns, host)) {
			const name = await ns.prompt(`Create a Corporation? (Leave empty if no)`, {'type': 'text'});
			if (name !== '') {
				const corp = eval('ns.corporation'); // Cheating here because using 1 TiB of RAM to start a corporation is overkill
				corp.createCorporation(name);
				printBoth(ns, `Started a corporation: ${name}`);
			} else corp = false;
		}
		if (hasCorps && ns.getPlayer().hasCorporation && corp && !ns.isRunning(scripts.corp, host) &&
			enoughRam(ns, scripts.corp, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start corp manager?`)) {
				ns.exec(scripts.corp, host);
				printBoth(ns, `Started corp manager`);
			}
			corp = false;
		}
		// Bladeburner manager
		const hasBladeburner = ns.getPlayer().bitNodeN === 7 || ns.getOwnedSourceFiles().some(s => s.n === 7);
		if (hasBladeburner && !ns.getPlayer().inBladeburner && bladeburner &&
			!ns.isRunning(scripts.bladeburner, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Join Bladeburner Division?`)) {
				ns.bladeburner.joinBladeburnerDivision();
				printBoth(ns, `Joined Bladeburner Division`);
			} else bladeburner = false;
		}
		if (hasBladeburner && ns.getPlayer().inBladeburner && bladeburner && !ns.isRunning(scripts.bladeburner, host) &&
			enoughRam(ns, scripts.bladeburner, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start Bladeburner manager?`)) {
				ns.exec(scripts.bladeburner, host);
				printBoth(ns, `Started Bladeburner manager`);
			}
			bladeburner = false;
		}
		// Stock market manager
		if (ns.getPlayer().hasTixApiAccess && stock && !ns.isRunning(scripts.stock, host) &&
			enoughRam(ns, scripts.stock, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start stock market manager?`)) {
				ns.exec(scripts.stock, host);
				printBoth(ns, `Started stock market manager`);
			}
			stock = false;
		}
		// Hacknet manager
		if (hacknet && !ns.isRunning(scripts.hacknet, host) &&
			enoughRam(ns, scripts.hacknet, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start Hacknet manager?`)) {
				ns.exec(scripts.hacknet, host);
				printBoth(ns, `Started Hacknet manager`);
			}
			hacknet = false;
		}
		// Sleeve manager
		if ((ns.getPlayer().bitNodeN === 10 || ns.getOwnedSourceFiles().some(s => s.n === 10)) &&
			sleeve && !ns.isRunning(scripts.sleeve, host) &&
			enoughRam(ns, scripts.sleeve, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start sleeve manager?`)) {
				ns.exec(scripts.sleeve, host);
				printBoth(ns, `Started sleeve manager`);
			}
			sleeve = false;
		}
		// Stanek Manager
		const hasStanek = ns.getPlayer().bitNodeN === 13 || ns.getOwnedSourceFiles().some(s => s.n === 13);
		if (hasStanek && ns.getOwnedAugmentations().findIndex(e => e.includes('Stanek\'s Gift')) === -1 &&
			ns.getPlayer().money >= 200e3 && stanek && !ns.isRunning(scripts.stanek, host) &&
			!promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Accept Stanek's Gift?`)) {
				acceptStanek(ns);
				printBoth(ns, `Accepted Stanek's Gift`);
			} else stanek = false;
		}
		if (hasStanek && ns.getOwnedAugmentations().findIndex(e => e.includes('Stanek\'s Gift')) !== -1 &&
			!ns.isRunning(scripts.stanek, host) && stanek &&
			enoughRam(ns, scripts.stanek, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start Stanek's Gift manager?`)) {
				ns.exec(scripts.stanek, host);
				printBoth(ns, `Started Stanek's Gift manager`);
			}
			stanek = false;
		}
		// Check faction invites
		let factionInvitations = ns.checkFactionInvitations().filter(faction => factions.includes(faction));
		if (factionInvitations.length > 0 && enoughRam(ns, scripts.joinFactions, host) &&
			!promptScriptRunning(ns, host)) {
			ns.print(`Request to join ${factionInvitations}`);
			ns.exec(scripts.joinFactions, host, 1, ...factionInvitations);
			factions = factions.concat(factionInvitations); // Don't ask again
		}
		// Backdoor servers
		for (let server of getAccessibleServers(ns)) {
			if (!ns.getServer(server).backdoorInstalled &&
				!ns.isRunning(scripts.backdoor, host, server) &&
				server !== 'home') {
				if (server === 'w0r1d_d43m0n' && backdoorWorldDaemon) {
					if (await ns.prompt(`Install backdoor on w0r1d_d43m0n and finish Bitnode?`)) {
						ns.print(`Installing backdoor on ${server}`);
						ns.exec(scripts.backdoor, host, 1, server);
					}
					backdoorWorldDaemon = false;
				} else {
					ns.print(`Installing backdoor on ${server}`);
					ns.exec(scripts.backdoor, host, 1, server);
				}
			}
		}
		// Spend Hashes
		if (haveHacknetServers) await spendHashes(ns, 'Sell for Money');
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