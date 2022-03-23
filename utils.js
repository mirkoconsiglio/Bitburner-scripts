/**
 *
 * @param {NS} ns
 * @param {string} str
 */
export function printBoth(ns, str) {
	ns.print(str);
	ns.tprint(str);
}

/**
 *
 * @returns {string[]}
 */
export function getCities() {
	return ['Aevum', 'Chongqing', 'Sector-12', 'New Tokyo', 'Ishima', 'Volhaven'];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function copyScriptsToAll(ns) {
	for (let server of getServers(ns)) if (server !== 'home') await ns.scp(scriptsToCopy(), 'home', server);
}

/**
 *
 * @returns {Object<string>}
 */
export function getScripts() {
	return {
		cortex: 'cortex.js',
		upgradeHomeRam: '/player/upgrade-home-ram.js',
		upgradeHomeCores: '/player/upgrade-home-cores.js',
		joinFactions: '/factions/join-factions.js',
		hack: '/daemons/hack.js',
		grow: '/daemons/grow.js',
		weaken: '/daemons/weaken.js',
		charge: '/daemons/charge.js',
		intelligence: '/daemons/intelligence.js',
		batcher: '/hacking/batcher.js',
		backdoor: '/hacking/backdoor.js',
		share: '/daemons/share.js',
		utils: 'utils.js',
		gang: '/gang/manager.js',
		corp: '/corporation/autopilot.js',
		bladeburner: '/bladeburner/autopilot.js',
		stock: '/stock-market/autopilot.js',
		hacknet: '/hacknet/manager.js',
		sleeve: '/sleeve/autopilot.js',
		stanek: '/stanek/controller.js',
	};
}

/**
 *
 * @returns {string[]}
 */
export function getManagerScripts() {
	const scripts = getScripts();
	return [
		scripts.cortex,
		scripts.gang,
		scripts.corp,
		scripts.bladeburner,
		scripts.stock,
		scripts.hacknet,
		scripts.sleeve,
		scripts.stanek,
		scripts.batcher
	];
}

/**
 *
 * @returns {string[]}
 */
export function scriptsToCopy() {
	return Object.values(getScripts());
}

/**
 *
 * @returns {string[]}
 */
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

/**
 *
 * @returns {string[]}
 */
export function getCompanies() {
	return [
		'ECorp', 'MegaCorp', 'Bachman and Associates', 'Blade Industries', 'NWO',
		'Clarke Incorporated', 'OmniTek Incorporated', 'Four Sigma', 'KuaiGong International',
		'Fulcrum Technologies', 'Storm Technologies', 'DefComm', 'Helios Labs', 'VitaLife',
		'Icarus Microsystems', 'Universal Energy', 'Galactic Cybersystems', 'AeroCorp',
		'Omnia Cybersystems', 'Solaris Space Systems', 'DeltaOne', 'Global Pharmaceuticals',
		'Nova Medical', 'CIA', 'NSA', 'Watchdog Security', 'LexoCorp', 'Rho Construction',
		'Alpha Enterprises', 'Aevum Police', 'SysCore Securities', 'CompuTek', 'NetLink Technologies',
		'Carmichael Security', 'FoodNStuff', 'JoesGuns', 'Ishima Omega Software', 'Noodle Bar'
	];
}

/**
 *
 * @returns {string[]}
 */
export function getGangs() {
	return ['Slum Snakes', 'Tetrads', 'The Syndicate', 'The Dark Army', 'Speakers for the Dead',
		'NiteSec', 'The Black Hand'];
}

/**
 *
 * @returns {Object<Object<string, boolean, boolean, boolean>[]>}
 */
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

/**
 *
 * @param {NS} ns
 * @param {number} minimumRam
 */
export function deployBatchers(ns, minimumRam = 2 ** 14) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);
	// filter and sort servers according to RAM
	const hosts = servers.filter(server => ns.getServerMaxRam(server) >= minimumRam).sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a));
	// Deploy batchers
	for (let i = 0; i < Math.min(hosts.length, hackables.length); i++) {
		if (!ns.isRunning(scripts.batcher, hosts[i], hackables[i])) {
			ns.scriptKill(scripts.batcher, hosts[i]);
			ns.exec(scripts.batcher, hosts[i], 1, hackables[i]);
		}
	}
}

/**
 *
 * @param {NS} ns
 */
export function manageAndHack(ns) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);
	const [freeRams, filteredHackables] = getFreeRam(ns, servers, hackables);
	const hackstates = getHackStates(ns, servers, filteredHackables);
	for (const target of filteredHackables) {
		const money = ns.getServerMoneyAvailable(target);
		const maxMoney = ns.getServerMaxMoney(target);
		const minSec = ns.getServerMinSecurityLevel(target);
		const sec = ns.getServerSecurityLevel(target);
		const secDiff = sec - minSec;
		if (secDiff > 0) {
			const threads = Math.ceil(secDiff * 20) - hackstates.get(target).weaken;
			if (threads > 0 && !findPlaceToRun(ns, scripts.weaken, threads, freeRams, target)) return;
		}
		let moneyPercent = money / maxMoney;
		if (moneyPercent === 0) moneyPercent = 0.1;
		if (moneyPercent < 0.9) {
			const threads = Math.ceil(ns.growthAnalyze(target, 1 / moneyPercent)) - hackstates.get(target).grow;
			if (threads > 0 && !findPlaceToRun(ns, scripts.grow, threads, freeRams, target)) return;
		}
		if (moneyPercent > 0.75 && secDiff < 50) {
			let threads = Math.floor(ns.hackAnalyzeThreads(target, money - (0.4 * maxMoney))) - hackstates.get(target).hack;
			if (threads > 0 && !findPlaceToRun(ns, scripts.hack, threads, freeRams, target)) return;
		}
	}
}

/**
 *
 * @param {NS} ns
 * @param {string[]} servers
 * @param {string[]} hackables
 * @returns {Object<number, number, number>}
 */
function getHackStates(ns, servers, hackables) {
	const scripts = getScripts();
	const hackstates = new Map();
	for (let server of servers.values()) {
		for (let hackable of hackables.values()) {
			let weakenScript = ns.getRunningScript(scripts.weaken, server, hackable);
			let growScript = ns.getRunningScript(scripts.grow, server, hackable);
			let hackScript = ns.getRunningScript(scripts.hack, server, hackable);
			if (hackstates.has(hackable)) {
				hackstates.get(hackable).weaken += !weakenScript ? 0 : weakenScript.threads;
				hackstates.get(hackable).grow += !growScript ? 0 : growScript.threads;
				hackstates.get(hackable).hack += !hackScript ? 0 : hackScript.threads;
			} else {
				hackstates.set(hackable, {
					weaken: !weakenScript ? 0 : weakenScript.threads,
					grow: !growScript ? 0 : growScript.threads,
					hack: !hackScript ? 0 : hackScript.threads
				});
			}
		}
	}
	return hackstates;
}

/**
 *
 * @param {NS} ns
 */
export function updateOverview(ns) {
	const doc = eval('document');
	const hook0 = doc.getElementById('overview-extra-hook-0');
	const hook1 = doc.getElementById('overview-extra-hook-1');
	try {
		const headers = [];
		const values = [];
		headers.push(`Income\u00A0`);
		values.push(`${ns.nFormat(ns.getScriptIncome()[0], '$0.000a')}`);
		headers.push(`Karma`);
		values.push(`${ns.nFormat(ns.heart.break(), '0.000a')}`);
		hook0.innerText = headers.join('\n');
		hook1.innerText = values.join('\n');
	} catch (err) {
		ns.print(`ERROR: Update Skipped: ${String(err)}`);
	}
}

/**
 *
 * @param {NS} ns
 * @param {string} server
 * @returns {null|string[]}
 */
export function routeFinder(ns, server) {
	const route = [];
	const found = recursiveRouteFinder(ns, '', ns.getHostname(), server, route);
	if (found) return route;
	else return null;
}

/**
 *
 * @param {NS} ns
 * @param {string} parent
 * @param {string} host
 * @param {string} server
 * @param {string[]} route
 * @returns {boolean}
 */
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

/**
 *
 * @param {NS} ns
 * @returns {string[]}
 */
export function getServers(ns) {
	const serverList = ['home'];
	for (let s of serverList) {
		ns.scan(s).filter(n => !serverList.includes(n)).forEach(n => serverList.push(n));
	}
	return serverList;
}

/**
 *
 * @param {NS} ns
 * @param {string} server
 * @returns {boolean}
 */
export function hackServer(ns, server) {
	if (ns.hasRootAccess(server)) return true;
	let portOpened = 0;
	if (ns.fileExists('BruteSSH.exe', 'home')) {
		ns.brutessh(server);
		portOpened++;
	}
	if (ns.fileExists('FTPCrack.exe', 'home')) {
		ns.ftpcrack(server);
		portOpened++;
	}
	if (ns.fileExists('HTTPWorm.exe', 'home')) {
		ns.httpworm(server);
		portOpened++;
	}
	if (ns.fileExists('relaySMTP.exe', 'home')) {
		ns.relaysmtp(server);
		portOpened++;
	}
	if (ns.fileExists('SQLInject.exe', 'home')) {
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

/**
 *
 * @param {NS} ns
 * @returns {string[]}
 */
export function getAccessibleServers(ns) {
	return getServers(ns).filter(server => hackServer(ns, server) && !server.startsWith('hacknet-node-'));
}

/**
 *
 * @param {NS} ns
 * @param {string} script
 * @param {number} threads
 * @param {Object<string, number>[]} freeRams
 * @param {*[]} scriptArgs
 * @returns {boolean}
 */
export function findPlaceToRun(ns, script, threads, freeRams, ...scriptArgs) {
	const scriptRam = ns.getScriptRam(script);
	let remainingThreads = threads;
	while (freeRams.length > 0) {
		const host = freeRams[0].host;
		const ram = freeRams[0].freeRam;
		if (ram < scriptRam) freeRams.shift();
		else if (ram < scriptRam * remainingThreads) { // Put as many threads as we can
			let threadsForThisHost = Math.floor(ram / scriptRam);
			ns.exec(script, host, threadsForThisHost, ...scriptArgs);
			remainingThreads -= threadsForThisHost;
			freeRams.shift();
		} else { // All remaining threads were placed
			ns.exec(script, host, remainingThreads, ...scriptArgs);
			freeRams[0].freeRam -= scriptRam * remainingThreads;
			return true;
		}
	}
	return false;
}

/**
 *
 * @param {NS} ns
 * @param {string[]} servers
 * @param {string[]} hackables
 * @param {boolean} occupy
 * @returns {Object<string, number>[] | [Object<string, number>[], string[]]}
 */
export function getFreeRam(ns, servers, hackables, occupy = false) {
	const scripts = getScripts();
	const data = readFromFile(ns, getPortNumbers().reservedRam);
	const freeRams = [];
	const unhackables = [];
	for (const server of servers) {
		if (hackables && ns.scriptRunning(scripts.batcher, server)) { // Check if we have a batcher running on this server
			const process = ns.ps(server).find(s => s.filename === scripts.batcher); // Find the process of the batcher
			unhackables.push(process.args[0]); // Don't hack the target of the batcher
			if (!occupy) continue; // Check if we want to run scripts on the host
		}
		const freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - (data[server] ?? 0);
		if (freeRam > 0) freeRams.push({host: server, freeRam: freeRam});
	}
	const sortedFreeRams = freeRams.sort((a, b) => b.freeRam - a.freeRam);
	if (hackables) {
		const filteredHackables = hackables.filter(hackable => !unhackables.includes(hackable));
		return [sortedFreeRams, filteredHackables];
	} else return sortedFreeRams;
}

/**
 *
 * @param {NS} ns
 * @param {string[]} servers
 * @param {number} cores
 * @returns {string[]}
 */
export function getOptimalHackable(ns, servers, cores = 1) {
	return servers.filter(server => ns.getServerMaxMoney(server) > 0).sort((a, b) => targetCost(ns, b, cores)[0] - targetCost(ns, a, cores)[0]);
}

/**
 *
 * @param {NS} ns
 * @param {string} target
 * @param {number} cores
 * @param {number} hackPercent
 * @param {number} freeRam
 * @returns {[number, number, number]}
 */
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
/**
 *
 * @param {NS} ns
 * @param {string} server
 * @returns {number}
 */
export function altTargetCost(ns, server) { // Doesn't use Formulas
	const hack = ns.hackAnalyzeChance(server) * ns.hackAnalyze(server) * ns.getServerMaxMoney(server) ** 4 / ns.getHackTime(server);
	const grow = ns.getGrowTime(server) * ns.growthAnalyze(server, 2) ** 2;
	const weaken = ns.getWeakenTime(server) * ns.getServerMinSecurityLevel(server) ** 2;
	return hack / (grow * weaken);
}

/**
 *
 * @returns {Object<string, number>[]}
 */
export function getUsefulPrograms() {
	return [
		{name: 'BruteSSH.exe', level: 50},
		{name: 'FTPCrack.exe', level: 100},
		{name: 'relaySMTP.exe', level: 300},
		{name: 'HTTPWorm.exe', level: 400},
		{name: 'SQLInject.exe', level: 800}
	];
}

/**
 *
 * @param {NS} ns
 * @param {string} server
 * @returns {boolean}
 */
export function promptScriptRunning(ns, server) {
	for (const script of getPromptScripts()) if (ns.scriptRunning(script, server)) return true;
	return false;
}

/**
 *
 * @returns {string[]}
 */
function getPromptScripts() {
	const scripts = getScripts();
	return [
		scripts.joinFactions,
		scripts.upgradeHomeRam,
		scripts.upgradeHomeCores,
		'/augmentations/install-augmentations.js',
		'/augmentations/purchase-augmentations.js',
		'/build/script-remover.js'
	];
}

/**
 *
 * @param {NS} ns
 * @param {string} script
 * @param {string} server
 * @returns {boolean}
 */
export function enoughRam(ns, script, server = ns.getHostname()) {
	return ns.getScriptRam(script, server) <= ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}

/**
 *
 * @returns {Object<number>}
 */
export function getPortNumbers() {
	return {
		reservedRam: 1,
		gang: 2,
		corp: 3,
		augmentations: 4,
		hack: 5,
		bladeburner: 7,
		stock: 8,
		hacknet: 9,
		sleeve: 10,
		stanek: 13
	};
}

/**
 *
 * @param {number} portNumber
 * @returns {Object<*>}
 */
export function defaultPortData(portNumber) {
	switch (portNumber) {
		case 1:
			return {home: 128};
		case 2:
			return undefined;
		case 3:
			return undefined;
		case 4:
			return undefined;
		case 5:
			return undefined;
		case 6:
			return undefined;
		case 7:
			return undefined;
		case 8:
			return undefined;
		case 9:
			return undefined;
		case 10:
			return Object.fromEntries(Array.from({length: 8}, (_, i) => [i, true]));
		case 11:
			return undefined;
		case 12:
			return undefined;
		case 13:
			return {
				pattern: 'starter',
				maxCharges: 100
			};
		case 14:
			return undefined;
		case 15:
			return undefined;
		case 16:
			return undefined;
		case 17:
			return undefined;
		case 18:
			return undefined;
		case 19:
			return undefined;
		case 20:
			return undefined;
		default:
			throw new Error(`Trying to use an invalid port: ${portNumber}. Only ports 1-20 are valid.`);
	}
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function initData(ns) {
	for (let i = 1; i <= 20; i++) {
		const data = readFromFile(ns, i);
		await writeToFile(ns, getFileHandle(i), data);
	}
}

/**
 *
 * @param {NS} ns
 * @param {number} portNumber
 * @param {boolean} write
 * @param {boolean} clear
 * @returns {Object<*>}
 */
export function getDataFromPort(ns, portNumber, write = true, clear = true) {
	const port = ns.getPortHandle(portNumber);
	const data = port.empty() ? defaultPortData(portNumber) : port.read();
	if (clear) port.clear();
	if (write) port.write(data);
	return data;
}

/**
 *
 * @param {number} portNumber
 * @returns {string}
 */
export function getFileHandle(portNumber) {
	return `/data/${portNumber}.txt`;
}

/**
 *
 * @param {NS} ns
 * @param {string} handle
 * @param {*} data
 * @param {string} mode
 */
async function writeToFile(ns, handle, data, mode = 'w') {
	if (typeof data !== 'string') data = JSON.stringify(data);
	await ns.write(handle, data, mode);
}

/**
 *
 * @param {NS} ns
 * @param {number} portNumber
 * @param {boolean} saveToFile
 * @param {string} mode
 * @returns {Object<*>}
 */
export function readFromFile(ns, portNumber) {
	const data = ns.read(getFileHandle(portNumber));
	return data ? JSON.parse(data) : defaultPortData(portNumber);
}

/**
 *
 * @param {NS} ns
 * @param {number} portNumber
 * @param {Object<*>} data
 * @param {string} mode
 * @returns {Promise<void>}
 */
export async function modifyFile(ns, portNumber, dataToModify, mode = 'w') {
	const data = readFromFile(ns, portNumber);
	for (const [key, val] of Object.entries(dataToModify)) data[key] = val;
	await writeToFile(ns, getFileHandle(portNumber), data, mode);
}