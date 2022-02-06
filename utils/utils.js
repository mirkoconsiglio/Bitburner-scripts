export function printBoth(ns, str) {
	ns.print(str);
	ns.tprint(str);
}

export function getCities() {
	return ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven'];
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
		deployDaemons: '/hacking/deploy-daemons.js',
		utils: '/utils/utils.js',
		share: '/utils/share.js',
		combatGang: '/gang/combat-gang.js',
		hackingGang: '/gang/hacking-gang.js',
		corp: '/corporation/autopilot.js',
		bladeburner: '/bladeburner/autopilot.js',
		stock: '/stock-market/stock-market.js',
		sleeve: '/sleeve/autopilot.js',
		ui: '/ui/overview.js',
		upgradeHomeRam: '/utils/upgrade-home-ram.js',
		upgradeHomeCores: '/utils/upgrade-home-cores.js',
		backdoor: '/utils/backdoor.js',
		joinFactions: '/utils/joinFactions.js'
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
		'Illuminati', 'Bladeburners'
	];
}

export function getCompanies() {
	return [
		'ECorp', 'MegaCorp', 'Bachman and Associates', 'Blade Industries', 'NWO',
		'Clarke Incorporated', 'OmniTek Incorporated', 'Four Sigma', 'KuaiGong International', 'Fulcrum Technologies',
		'Storm Technologies', 'DefComm', 'Helios Labs', 'VitaLife', 'Icarus Microsystems',
		'Universal Energy', 'Galactic Cybersystems', 'AeroCorp', 'Omnia Cybersystems',
		'Solaris Space Systems', 'DeltaOne', 'Global Pharmaceuticals', 'Nova Medical',
		'CIA', 'NSA', 'Watchdog Security', 'LexoCorp', 'Rho Construction', 'Alpha Enterprises',
		'Aevum Police', 'SysCore Securities', 'CompuTek', 'NetLink Technologies',
		'Carmichael Security', 'FoodNStuff', 'JoesGuns', 'Ishima Omega Software', 'Noodle Bar'
	];
}

export function routeFinder(ns, server) {
	const route = [];
	const found = recursiveRouteFinder(ns, '', ns.getHostname(), server, route);
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
	const serverList = ['home'];
	for (let s of serverList) {
		ns.scan(s).filter(n => !serverList.includes(n)).forEach(n => serverList.push(n));
	}
	return serverList;
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

export function findPlaceToRun(ns, script, threads, freeRams, ...scriptArgs) {
	const scriptRam = ns.getScriptRam(script);
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

export function getFreeRam(ns, servers, hackables, occupy = false) {
	const scripts = getScripts();
	const freeRams = [];
	const unhackables = [];
	for (let server of servers) {
		if (hackables && ns.scriptRunning(scripts.daemon, server)) {
			for (let hackable of hackables) {
				if (ns.getRunningScript(scripts.daemon, server, hackable)) {
					unhackables.push(hackable);
				}
			}
			if (!occupy) continue;
		}
		let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
		if (server === 'home') freeRam -= 90;
		if (freeRam > 1) freeRams.push({host: server, freeRam: freeRam});
	}
	const sortedFreeRams = freeRams.sort((a, b) => b.freeRam - a.freeRam);
	if (hackables) {
		let filteredHackables = hackables.filter(hackable => !unhackables.includes(hackable));
		return [sortedFreeRams, filteredHackables];
	} else return sortedFreeRams;
}

export function getOptimalHackable(ns, servers, cores = 1) {
	return servers.filter(server => ns.getServerMaxMoney(server) > 0).sort((a, b) => targetCost(ns, b, cores) - targetCost(ns, a, cores));
}

export function targetCost(ns, target, cores = 1) { // TODO: include time in the cost function
	const form = ns.formulas.hacking;
	const player = ns.getPlayer(); // Get player info
	const server = ns.getServer(target); // Get server info
	server.hackDifficulty = server.minDifficulty; // Assume server is at min sec
	// Security
	const hackSec = ns.hackAnalyzeSecurity(1); // Sec increase for 1 hack thread
	const growSec = ns.growthAnalyzeSecurity(1); // Sec increase for 1 grow thread
	const weakenSec = ns.weakenAnalyze(1, cores); // Sec decrease for 1 weaken thread
	// Script Rams
	const scripts = getScripts();
	const hackRam = ns.getScriptRam(scripts.hack);
	const growRam = ns.getScriptRam(scripts.grow);
	const weakenRam = ns.getScriptRam(scripts.weaken);
	// Percent to hack (decimal form)
	const hackPercent = 0.01;
	// Hack threads per hack percent
	const hackThreadsPerHackPercent = hackPercent / form.hackPercent(server, player);
	// Weaken threads needed per hack thread
	const weakenThreadsPerHackThread = hackSec / weakenSec;
	// Weaken threads per hack thread per hack percent
	const weakenThreadsPerHackPercentAfterHack = weakenThreadsPerHackThread * hackThreadsPerHackPercent;
	// Percent to grow by 1 thread at min sec
	const growPercent = form.growPercent(server, 1, player, cores);
	// Grow threads needed per hack percent
	const growThreadsPerHackPercent = Math.log(1 / (1 - hackPercent)) / Math.log(growPercent);
	// Weaken threads needed per grow thread
	const weakenThreadsPerGrowThread = growSec / weakenSec;
	// Weaken threads needed per grow thread per hack percent
	const weakenThreadsPerHackPercentAfterGrow = weakenThreadsPerGrowThread * growThreadsPerHackPercent;
	// Total threads per hack percent
	const totalRamPerHackPercent = hackThreadsPerHackPercent * hackRam + growThreadsPerHackPercent * growRam +
		(weakenThreadsPerHackPercentAfterHack + weakenThreadsPerHackPercentAfterGrow) * weakenRam;
	// Chance to hack at min sec
	const chance = form.hackChance(server, player);
	// Average money stolen per hack percent
	const averageMoneyPerHackPercent = server.moneyMax * hackPercent * chance;
	// Average money stolen per unit RAM
	const averageMoneyPerRam = averageMoneyPerHackPercent / totalRamPerHackPercent;
	//
	return averageMoneyPerRam;
}

export function altTargetCost(ns, server) {
	const hack = ns.hackAnalyzeChance(server) * ns.hackAnalyze(server) * ns.getServerMaxMoney(server) ** 4 / ns.getHackTime(server);
	const grow = ns.getGrowTime(server) * ns.growthAnalyze(server, 2) ** 2;
	const weaken = ns.getWeakenTime(server) * ns.getServerMinSecurityLevel(server) ** 2;
	return hack / (grow * weaken);
}

export function promptScriptRunning(ns, server) {
	for (let script of getPromptScripts()) {
		if (ns.scriptRunning(script, server)) return true;
	}
	return false;
}

function getPromptScripts() {
	return ['/utils/join-factions.js', '/utils/upgrade-home-ram.js', '/utils/upgrade-home-cores.js'];
}

export function enoughRam(ns, script, server = ns.getHostname()) {
	return ns.getScriptRam(script, server) <= ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}