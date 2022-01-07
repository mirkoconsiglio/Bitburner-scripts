export function printBoth(ns, str) {
	ns.print(str);
	ns.tprint(str);
}

export function scriptsToCopy() {
	return ['utils.js', 'daemon.js', 'hack.js', 'grow.js', 'weaken.js'];
}

export async function copyScriptsToAll(ns) {
	for (let server of getServers(ns)) {
		if (server !== 'home') await ns.scp(scriptsToCopy(), 'home', server);
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
		if (hackables && ns.scriptRunning('daemon.js', server)) {
			for (let hackable of hackables) {
				if (ns.getRunningScript('daemon.js', server, hackable)) unhackables.push(hackable);
			}
			continue;
		}
		let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
		if (server === 'home') freeRam -= 32;
		if (freeRam > 0) freeRams.push({host: server, freeRam: freeRam});
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

export function isUsefulAugmentation(ns, name) {
	return (name !== 'NeuroFlux Governor' && // Ignore NFG
	( 	// Looking for hacking, faction rep and special augs.
		ns.getAugmentationStats(name).hacking_mult ||
		ns.getAugmentationStats(name).hacking_exp_mult ||
		ns.getAugmentationStats(name).hacking_chance_mult ||
		ns.getAugmentationStats(name).hacking_speed_mult ||
		ns.getAugmentationStats(name).hacking_money_mult ||
		ns.getAugmentationStats(name).hacking_grow_mult ||
		ns.getAugmentationStats(name).faction_rep_mult ||
		name === 'CashRoot Starter Kit' ||
		name === 'Neuroreceptor Management Implant'
	));
}