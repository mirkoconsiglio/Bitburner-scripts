export function printBoth(ns, str) {
	ns.print(str);
	ns.tprint(str);
}

export async function copyScriptsToAll(ns) {
	for (let server of getServers(ns)) {
		if (server !== 'home') {
			await ns.scp(scriptsToCopy(), 'home', server);
		}
	}
}

export function scriptsToCopy() {
	return Object.values(getScripts());
}

export function getScripts() {
	return {
		hack: '/hacking/hack.js',
		grow: '/hacking/grow.js',
		weaken: '/hacking/weaken.js',
		daemon: '/hacking/daemon.js',
		utils: '/utils/utils.js'
	}
}

export function getFactions() {
	return [
		'CyberSec', 'Tian Di Hui', 'Netburners', 'Sector-12', 'Chongqing',
		'New Tokyo', 'Ishima', 'Aevum', 'Volhaven', 'NiteSec',
		'The Black Hand', 'BitRunners', 'ECorp', 'MegaCorp',
		'KuaiGong International', 'Four Sigma', 'NWO', 'Blade Industries',
		'OmniTek Incorporated', 'Bachman & Associates',
		'Clarke Incorporated', 'Fulcrum Secret Technologies',
		'Slum Snakes', 'Tetrads', 'Silhouette', 'Speakers for the Dead',
		'The Dark Army', 'The Syndicate', 'The Covenant', 'Daedalus',
		'Illuminati'
	];
}

export function getPrograms() {
	return [
		'BruteSSH.exe', 'FTPCrack.exe', 'relaySMTP.exe',
		'HTTPWorm.exe', 'SQLInject.exe', 'ServerProfiler.exe',
		'DeepscanV1.exe', 'DeepscanV2.exe', 'AutoLink.exe', 'Formulas.exe'
	];
}

export function routeFinder(ns, server) {
	let route = [];
	let found = recursiveRouteFinder(ns, '', ns.getHostname(), server, route);
	if (found) return route;
	else return null;
}

export function recursiveRouteFinder(ns, parent, host, server, route) {
	const children = ns.scan(host);
	for (let child of children) {
		if (parent === child) {
			continue;
		}
		if (child === server) {
			route.unshift(child);
			route.unshift(host);
			return true;
		}
		if (recursiveRouteFinder(ns, host, child, server, route)) {
			route.unshift(host);
			return true;
		}
	}
	return false;
}

export function getServers(ns) {
	let servers = new Set(['home']);
	recursiveScan('home', servers, ns);
	return [...servers];
}

export function recursiveScan(host, servers, ns) {
	let hosts = ns.scan(host);
	for (let h of hosts) {
		if (!servers.has(h)) {
			servers.add(h);
			recursiveScan(h, servers, ns);
		}
	}
}

export function hackServer(ns, server) {
	if (ns.hasRootAccess(server)) return true;

	let portOpened = 0;
	if (ns.fileExists('BruteSSH.exe')) {
		ns.brutessh(server);
		portOpened++;
	}
	if (ns.fileExists('FTPCrack.exe')) {
		ns.ftpcrack(server);
		portOpened++;
	}
	if (ns.fileExists('HTTPWorm.exe')) {
		ns.httpworm(server);
		portOpened++;
	}
	if (ns.fileExists('relaySMTP.exe')) {
		ns.relaysmtp(server);
		portOpened++;
	}
	if (ns.fileExists('SQLInject.exe')) {
		ns.sqlinject(server);
		portOpened++;
	}

	if (ns.getServerNumPortsRequired(server) <= portOpened
		&& ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
		ns.nuke(server);
		return true;
	}

	return false;
}

export function getAccessibleServers(ns) {
	return getServers(ns).filter(server => hackServer(ns, server));
}

export async function backdoor(ns, server) {
	let route = routeFinder(ns, server);
	if (route && hackServer(ns, server)) {
		for (let serv of route) {
			ns.connect(serv);
		}
		ns.tprint(`Installing backdoor on ${server}.`);
		await ns.installBackdoor();
		ns.tprint(`Backdoor successfully installed.`);
		for (let serv of route.reverse()) {
			ns.connect(serv);
		}
	}
}

export function findPlaceToRun(ns, script, threads, freeRams, scriptArgs) {
	let scriptRam = ns.getScriptRam(script);
	let remainingThread = threads;
	while (freeRams.length > 0) {
		let host = freeRams[0].host;
		let ram = freeRams[0].freeRam;

		if (ram < scriptRam) {
			freeRams.shift();
		} else if (ram < scriptRam * remainingThread) {
			let threadForThisHost = Math.floor(ram / scriptRam);
			ns.exec(script, host, threadForThisHost, ...scriptArgs);
			remainingThread -= threadForThisHost;
			freeRams.shift();
		} else {
			ns.exec(script, host, remainingThread, ...scriptArgs);
			freeRams[0].freeRam -= scriptRam * remainingThread;
			return true;
		}
	}
	return false;
}

export function getFreeRam(ns, servers, hackables) {
	let freeRams = [];
	let unhackables = [];
	for (let server of servers) {
		if (hackables && ns.scriptRunning('/hacking/daemon.js', server)) {
			for (let hackable of hackables) {
				if (ns.getRunningScript('/hacking/daemon.js', server, hackable)) {
					unhackables.push(hackable);
					break;
				}
			}
			continue;
		}
		let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
		if (server === 'home') freeRam -= 32;
		if (freeRam > 1) freeRams.push({host: server, freeRam: freeRam});
	}
	let sortedFreeRams = freeRams.sort((a, b) => b.freeRam - a.freeRam);
	if (hackables) {
		let filteredHackables = hackables.filter(hackable => !unhackables.includes(hackable));
		return [sortedFreeRams, filteredHackables];
	} else return sortedFreeRams;
}

export function getOptimalHackable(ns, servers) {
	return servers.filter(function (server, index, servers) {
		if (server === 'n00dles' && servers.length > 5) return false;
		else return ns.getServerMaxMoney(server) > 0;
	}).sort((a, b) => costFn(ns, b) - costFn(ns, a));
}

function costFn(ns, server) {
	let hack = ns.hackAnalyzeChance(server) * ns.hackAnalyze(server) * ns.getServerMaxMoney(server) ** 4 / ns.getHackTime(server);
	let grow = ns.getGrowTime(server) * ns.growthAnalyze(server, 2) ** 2;
	let weaken = ns.getWeakenTime(server) * ns.getServerMinSecurityLevel(server) ** 2;
	return hack / (grow * weaken);
}

export function isUsefulGeneral(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful general augmentations
			stats.faction_rep_mult ||
			name === 'CashRoot Starter Kit' ||
			name === 'Neurolink' ||
			name === 'PCMatrix' ||
			name === 'Neuroreceptor Management Implant'
		);
}

export function isUsefulHacking(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful hacking augmentations
			stats.hacking_mult ||
			stats.hacking_exp_mult ||
			stats.hacking_chance_mult ||
			stats.hacking_speed_mult ||
			stats.hacking_money_mult ||
			stats.hacking_grow_mult
		)
}

export function isUsefulCombat(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful combat augmentations
			stats.agility_exp_mult ||
			stats.agility_mult ||
			stats.defense_exp_mult ||
			stats.defense_mult ||
			stats.dexterity_exp_mult ||
			stats.dexterity_mult ||
			stats.strength_exp_mult ||
			stats.strength_mult ||
			stats.crime_money_mult ||
			stats.crime_success_mult
		);
}

export function isUsefulCompany(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful company augmentations
			stats.charisma_exp_mult ||
			stats.charisma_mult ||
			stats.company_rep_mult ||
			stats.work_money_mult
		);
}

export function isUsefulHacknet(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful hacknet augmentations
			stats.hacknet_node_core_cost_mult ||
			stats.hacknet_node_level_cost_mult ||
			stats.hacknet_node_money_mult ||
			stats.hacknet_node_purchase_cost_mult ||
			stats.hacknet_node_ram_cost_mult
		);
}

export function isUsefulBladeburner(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful bladeburner augmentations
			stats.bladeburner_analysis_mult ||
			stats.bladeburner_max_stamina_mult ||
			stats.bladeburner_stamina_gain_mult ||
			stats.bladeburner_success_chance_mult
		);
}