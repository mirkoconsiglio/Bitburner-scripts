// noinspection JSUnresolvedVariable

import {contractor} from '/contracts/contractor.js';
import {spendHashes} from '/hacknet/hash-spender.js';
import {acceptStanek} from '/stanek/accept.js';
import {
	copyScriptsToAll,
	deployBatchers,
	enoughRam,
	getAccessibleServers,
	getCracks,
	getGangs,
	getPortNumbers,
	getScripts,
	initData,
	manageAndHack,
	printBoth,
	promptScriptRunning,
	readFromFile,
	updateOverview,
	updateReservedRam
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
	const haveHacknetServers = ns.getPlayer().bitNodeN === 9 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 9);
	const bitnode8 = ns.getPlayer().bitNodeN === 8;
	const generalPort = getPortNumbers().general;
	// Variables
	let host = ns.getHostname();
	let contractorOnline = true;
	let upgradeRam = true;
	let upgradeCores = true;
	let homeRam = ns.getServer('home').maxRam;
	let homeCores = ns.getServer('home').cpuCores;
	let tor = !bitnode8;
	let programs = !bitnode8;
	let wse = true;
	let tix = true;
	let gang = true;
	let corp = !bitnode8;
	let bladeburner = !bitnode8;
	let stock = true;
	let hacknet = !bitnode8;
	let sleeve = true;
	let stanek = !bitnode8;
	let backdoorWorldDaemon = true;
	let factions = [];
	// noinspection InfiniteLoopJS
	while (true) {
		contractorOnline = readFromFile(ns, generalPort).contractor;
		// Heal player
		if (ns.getPlayer().hp.current < ns.getPlayer().hp.max) ns.singularity.hospitalize();
		// Contract solver (disables itself if any solution was incorrect)
		if (contractorOnline) contractorOnline = contractor(ns);
		// Purchase TOR
		if (tor && !ns.getPlayer().tor && ns.singularity.purchaseTor()) printBoth(ns, `Purchased TOR router`);
		// Purchase only useful programs
		if (programs && ns.getPlayer().tor) {
			for (const program of getCracks()) {
				if (!ns.fileExists(program.name, 'home') && ns.getPlayer().skills.hacking >= program.level &&
					ns.singularity.purchaseProgram(program.name))
					printBoth(ns, `Purchased ${program.name}`);
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
		if (ns.getPlayer().money >= ns.singularity.getUpgradeHomeRamCost() && upgradeRam &&
			!promptScriptRunning(ns, host) && homeRam < 2 ** 30 && enoughRam(ns, scripts.upgradeHomeRam, host)) {
			ns.exec(scripts.upgradeHomeRam, host);
			upgradeRam = false;
		}
		// Upgrade home cores
		if (ns.getPlayer().money >= ns.singularity.getUpgradeHomeCoresCost() && upgradeCores &&
			!promptScriptRunning(ns, host) && homeCores < 8 && enoughRam(ns, scripts.upgradeHomeCores, host)) {
			ns.exec(scripts.upgradeHomeCores, host);
			upgradeCores = false;
		}
		// Gang manager
		// noinspection JSUnresolvedFunction
		const hasGangs = ns.getPlayer().bitNodeN === 2 || (ns.singularity.getOwnedSourceFiles().some(s => s.n === 2) && ns.heart.break() <= -54e3);
		if (hasGangs && !ns.gang.inGang() && gang && !ns.scriptRunning(scripts.gang, host) &&
			!promptScriptRunning(ns, host)) {
			const gangs = getGangs().filter(g => ns.getPlayer().factions.includes(g));
			gangs.unshift('No');
			const gangName = await ns.prompt(`Create a gang?`, {'type': 'select', 'choices': gangs});
			if (gangName !== 'No') {
				ns.gang.createGang(gangName);
				printBoth(ns, `Created a gang with ${gangName}`);
			} else gang = false;
		}
		if (hasGangs && ns.gang.inGang() && gang && !ns.scriptRunning(scripts.gang, host) &&
			enoughRam(ns, scripts.gang, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start gang manager?`)) {
				if (!bitnode8) ns.exec(scripts.gang, host);
				else ns.exec(scripts.gang, host, 1, '--disable-equipment-buying');
				printBoth(ns, `Started gang manager`);
			}
			gang = false;
		}
		// Corp manager
		const hasCorps = ns.getPlayer().bitNodeN === 3 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3);
		if (hasCorps && !ns.getPlayer().hasCorporation && ns.getPlayer().money >= 150e9 && corp
			&& !ns.scriptRunning(scripts.corp, host) && !promptScriptRunning(ns, host)) {
			const name = await ns.prompt(`Create a Corporation? (Leave empty if no)`, {'type': 'text'});
			if (name !== '') {
				const corp = eval('ns.corporation'); // Cheating here because using 1 TiB of RAM to start a corporation is overkill
				corp.createCorporation(name, false);
				printBoth(ns, `Started a corporation: ${name}`);
			} else corp = false;
		}
		if (hasCorps && ns.getPlayer().hasCorporation && corp && !ns.scriptRunning(scripts.corp, host) &&
			enoughRam(ns, scripts.corp, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start corp manager?`)) {
				ns.exec(scripts.corp, host);
				printBoth(ns, `Started corp manager`);
			}
			corp = false;
		}
		// Bladeburner manager
		const hasBladeburner = ns.getPlayer().bitNodeN === 7 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 7);
		const hasCombatStats = ns.getPlayer().skills.strength >= 100 && ns.getPlayer().skills.defense >= 100 &&
			ns.getPlayer().skills.dexterity >= 100 && ns.getPlayer().skills.agility >= 100;
		if (hasBladeburner && hasCombatStats && !ns.getPlayer().inBladeburner && bladeburner &&
			!ns.scriptRunning(scripts.bladeburner, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Join Bladeburner Division?`)) {
				ns.bladeburner.joinBladeburnerDivision();
				printBoth(ns, `Joined Bladeburner Division`);
			} else bladeburner = false;
		}
		if (hasBladeburner && ns.getPlayer().inBladeburner && bladeburner && !ns.scriptRunning(scripts.bladeburner, host) &&
			enoughRam(ns, scripts.bladeburner, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start Bladeburner manager?`)) {
				ns.exec(scripts.bladeburner, host);
				printBoth(ns, `Started Bladeburner manager`);
			}
			bladeburner = false;
		}
		// Purchase WSE account
		if (!ns.stock.hasWSEAccount() && ns.getPlayer().money >= 200e6 &&
			wse && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Purchase WSE account?`)) {
				ns.stock.purchaseWseAccount();
				printBoth(ns, `Purchased WSE account`);
			} else wse = false;
		}
		// Purchase TIX API
		if (!ns.stock.hasTIXAPIAccess() && ns.getPlayer().money >= 5e9 &&
			tix && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Purchase TIX API?`)) {
				ns.stock.purchaseTixApi();
				printBoth(ns, `Purchased TIX API`);
			} else tix = false;
		}
		// Stock market manager
		if (ns.stock.hasTIXAPIAccess() && stock && !ns.scriptRunning(scripts.stock, host) &&
			enoughRam(ns, scripts.stock, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start stock market manager?`)) {
				if (!bitnode8) ns.exec(scripts.stock, host);
				else ns.exec(scripts.stock, host, 1, '--fracH', 0.001, '--fracB', 0.1);
				printBoth(ns, `Started stock market manager`);
			}
			stock = false;
		}
		// Hacknet manager
		if (hacknet && !ns.scriptRunning(scripts.hacknet, host) &&
			enoughRam(ns, scripts.hacknet, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start Hacknet manager?`)) {
				ns.exec(scripts.hacknet, host);
				printBoth(ns, `Started Hacknet manager`);
			}
			hacknet = false;
		}
		// Sleeve manager
		if ((ns.getPlayer().bitNodeN === 10 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 10)) &&
			sleeve && !ns.scriptRunning(scripts.sleeve, host) &&
			enoughRam(ns, scripts.sleeve, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start sleeve manager?`)) {
				if (!bitnode8) ns.exec(scripts.sleeve, host);
				else ns.exec(scripts.sleeve, host, 1, '--disable-augmentation-buying');
				printBoth(ns, `Started sleeve manager`);
			}
			sleeve = false;
		}
		// Stanek Manager
		const hasStanek = ns.getPlayer().bitNodeN === 13 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 13);
		if (hasStanek && ns.singularity.getOwnedAugmentations().findIndex(e => e.includes('Stanek\'s Gift')) === -1 &&
			ns.getPlayer().money >= 200e3 && stanek && !ns.scriptRunning(scripts.stanek, host) &&
			!promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Accept Stanek's Gift?`)) {
				acceptStanek(ns);
				printBoth(ns, `Accepted Stanek's Gift`);
			} else stanek = false;
		}
		if (hasStanek && ns.singularity.getOwnedAugmentations().findIndex(e => e.includes('Stanek\'s Gift')) !== -1 &&
			!ns.scriptRunning(scripts.stanek, host) && stanek &&
			enoughRam(ns, scripts.stanek, host) && !promptScriptRunning(ns, host)) {
			if (await ns.prompt(`Start Stanek's Gift manager?`)) {
				ns.exec(scripts.stanek, host);
				printBoth(ns, `Started Stanek's Gift manager`);
			}
			stanek = false;
		}
		// Check faction invites
		const factionInvitations = ns.singularity.checkFactionInvitations().filter(faction => !factions.includes(faction));
		if (factionInvitations.length > 0 && enoughRam(ns, scripts.joinFactions, host) &&
			!promptScriptRunning(ns, host)) {
			ns.print(`Request to join ${factionInvitations}`);
			ns.exec(scripts.joinFactions, host, 1, ...factionInvitations);
			factions = factions.concat(factionInvitations); // Don't ask again
		}
		// Backdoor servers
		for (const server of getAccessibleServers(ns)) {
			if (!ns.getServer(server).backdoorInstalled &&
				!ns.isRunning(scripts.backdoor, host, server) &&
				server !== 'home' && enoughRam(ns, scripts.backdoor, host)) {
				if (server === 'w0r1d_d43m0n' && backdoorWorldDaemon) {
					if (await ns.prompt(`Install backdoor on w0r1d_d43m0n and finish Bitnode?`)) {
						ns.print(`Installing backdoor on ${server}`);
						ns.exec(scripts.backdoor, host, 1, server);
					}
					backdoorWorldDaemon = false;
				} else if (server !== 'w0r1d_d43m0n') {
					ns.exec(scripts.backdoor, host, 1, server);
					ns.print(`Installing backdoor on ${server}`);
				}
			}
		}
		// Spend Hashes
		if (haveHacknetServers) await spendHashes(ns, 'Sell for Money');
		// Deploy batchers
		deployBatchers(ns);
		// Simple hack manager
		manageAndHack(ns);
		// Update overview
		updateOverview(ns);
		// Update reserved RAM
		await updateReservedRam(ns);
		// Update file data
		await modifyFile(ns, generalPort, {contractor: contractorOnline});
		// Update every second
		await ns.sleep(1000);
	}
}