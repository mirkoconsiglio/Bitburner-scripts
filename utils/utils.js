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

export function getScripts() {
	return {
		hack: '/hacking/hack.js',
		grow: '/hacking/grow.js',
		weaken: '/hacking/weaken.js',
		daemon: '/hacking/daemon.js',
		deployDaemons: '/hacking/deploy-daemons.js',
		backdoor: '/hacking/backdoor.js',
		share: '/hacking/share.js',
		utils: '/utils/utils.js',
		combatGang: '/gang/combat-gang.js',
		hackingGang: '/gang/hacking-gang.js',
		corp: '/corporation/autopilot.js',
		bladeburner: '/bladeburner/autopilot.js',
		stock: '/stock-market/autopilot.js',
		hacknet_server: '/hacknet/hacknet-server-manager.js',
		hacknet_node: '/hacknet/hacknet-node-manager.js',
		sleeve: '/sleeve/autopilot.js',
		ui: '/ui/overview.js',
		upgradeHomeRam: '/utils/upgrade-home-ram.js',
		upgradeHomeCores: '/utils/upgrade-home-cores.js',
		joinFactions: '/utils/join-factions.js'
	}
}

export function scriptsToCopy() {
	return Object.values(getScripts());
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

export function getJobs() {
	return {
		agent: {
			name: 'Agent',
			hacking: true,
			combat: true,
			charisma: true
		},
		business: {
			name: 'Business',
			hacking: true,
			combat: false,
			charisma: true
		},
		it: {
			name: 'IT',
			hacking: true,
			combat: false,
			charisma: true
		},
		security: {
			name: 'Security',
			hacking: true,
			combat: true,
			charisma: true
		},
		software: {
			name: 'Software',
			hacking: true,
			combat: false,
			charisma: true
		},
		software_consultant: {
			name: 'Software Consultant',
			hacking: true,
			combat: false,
			charisma: true
		},
		employee: {
			name: 'Employee',
			hacking: false,
			combat: true,
			charisma: true
		},
		part_time_employee: {
			name: 'part-time Employee',
			hacking: false,
			combat: true,
			charisma: true
		},
		waiter: {
			name: 'Employee',
			hacking: false,
			combat: true,
			charisma: true
		},
		part_time_waiter: {
			name: 'part-time Waiter',
			hacking: false,
			combat: true,
			charisma: true
		}
	};
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
	return getServers(ns).filter(server => hackServer(ns, server) && !server.startsWith('hacknet-node-'));
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
	return servers.filter(server => ns.getServerMaxMoney(server) > 0).sort((a, b) => targetCost(ns, b, cores)[0] - targetCost(ns, a, cores)[0]);
}

export function targetCost(ns, target, cores = 1, hackPercent = 0.5, freeRam = 2 ** 15) {
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

	// RAM calculations

	// Hack threads per hack percent
	const hackThreads = hackPercent / form.hackPercent(server, player);
	// Weaken threads needed per hack thread
	const weakenThreadsPerHackThread = hackSec / weakenSec;
	// Weaken threads per hack thread
	const weakenThreadsAfterHack = weakenThreadsPerHackThread * hackThreads;
	// Percent to grow by 1 thread at min sec
	const growPercent = form.growPercent(server, 1, player, cores);
	// Grow threads needed
	const growThreads = Math.log(1 / (1 - hackPercent)) / Math.log(growPercent);
	// Weaken threads needed per grow thread
	const weakenThreadsPerGrowThread = growSec / weakenSec;
	// Weaken threads needed per grow thread
	const weakenThreadsAfterGrow = weakenThreadsPerGrowThread * growThreads;
	// Cycle RAM
	const cycleRam = hackThreads * hackRam + growThreads * growRam + (weakenThreadsAfterHack + weakenThreadsAfterGrow) * weakenRam;
	// Number of cycles in one cycle group
	const cycleCount = Math.floor(freeRam / cycleRam);
	// Group RAM
	const groupRam = cycleRam * cycleCount;

	// Stolen money calculations

	// Chance to hack at min sec
	const chance = form.hackChance(server, player);
	// Average money stolen per cycle
	const averageMoneyPerCycle = server.moneyMax * hackPercent * chance;
	// Average money stolen per group
	const averageMoneyPerGroup = averageMoneyPerCycle * cycleCount;

	// Time taken calculations

	// Time taken for weaken
	const weakenTime = form.weakenTime(server, player);
	// Time taken from one cycle to the next
	const cycleDelay = weakenTime / cycleCount;
	// Time taken from one group to the next
	const groupDelay = cycleDelay * cycleCount; // equivalent to weaken time

	// Cost function calculations

	// Average Money per unit Ram per unit time
	const averageMoneyPerRamPerTime = averageMoneyPerGroup / (2 * groupDelay * groupRam);
	// Average money stolen per unit Ram
	const averageMoneyPerRam = averageMoneyPerRamPerTime * (2 * groupDelay);
	// Average money stolen per unit time
	const averageMoneyPerTime = averageMoneyPerGroup * groupRam;

	// Cost
	return [averageMoneyPerRamPerTime, averageMoneyPerRam, averageMoneyPerTime];
}

// noinspection JSUnusedGlobalSymbols
export function altTargetCost(ns, server) { // Doesn't use Formulas
	const hack = ns.hackAnalyzeChance(server) * ns.hackAnalyze(server) * ns.getServerMaxMoney(server) ** 4 / ns.getHackTime(server);
	const grow = ns.getGrowTime(server) * ns.growthAnalyze(server, 2) ** 2;
	const weaken = ns.getWeakenTime(server) * ns.getServerMinSecurityLevel(server) ** 2;
	return hack / (grow * weaken);
}

export function getUSefulPrograms() {
	return [
		{name: 'BruteSSH.exe', level: 50},
		{name: 'FTPCrack.exe', level: 100},
		{name: 'relaySMTP.exe', level: 300},
		{name: 'HTTPWorm.exe', level: 400},
		{name: 'SQLInject.exe', level: 800}
	];
}

export function promptScriptRunning(ns, server) {
	for (let script of getPromptScripts()) {
		if (ns.scriptRunning(script, server)) return true;
	}
	return false;
}

function getPromptScripts() {
	return [
		'/utils/join-factions.js',
		'/utils/upgrade-home-ram.js',
		'/utils/upgrade-home-cores.js',
		'/augmentations/install-augmentations.js',
		'/augmentations/purchase-augmentations.js',
		'/build/script-remover.js',
		'/sleeve/company.js',
		'/sleeve/crime.js',
		'/sleeve/faction.js',
		'/sleeve/gym.js',
		'/sleeve/shock-recovery.js',
		'/sleeve/synchronize.js',
		'/sleeve/university.js'
	];
}

export function enoughRam(ns, script, server = ns.getHostname()) {
	return ns.getScriptRam(script, server) <= ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}