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
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function copyScriptsToAll(ns) {
	for (let server of getServers(ns)) if (server !== 'home') await ns.scp(scriptsToCopy(), server, 'home');
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
		stanek: '/stanek/controller.js'
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
 * @returns {Object<Object>}
 */
function getOrganisations() {
	return {
		'ECorp': {
			location: 'Aevum',
			stockSymbol: 'ECP',
			server: 'ecorp',
			faction: 'ECorp',
			company: 'ECorp',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'MegaCorp': {
			location: 'Sector-12',
			stockSymbol: 'MGCP',
			server: 'megacorp',
			faction: 'MegaCorp',
			company: 'MegaCorp',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'Blade Industries': {
			location: 'Sector-12',
			stockSymbol: 'BLD',
			server: 'blade',
			faction: 'Blade Industries',
			company: 'Blade Industries',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'Clarke Incorporated': {
			location: 'Aevum',
			stockSymbol: 'CLRK',
			server: 'clarkinc',
			faction: 'Clarke Incorporated',
			company: 'Clarke Incorporated',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'OmniTek Incorporated': {
			location: 'Volhaven',
			stockSymbol: 'OMTK',
			server: 'omnitek',
			faction: 'OmniTek Incorporated',
			company: 'OmniTek Incorporated',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'Four Sigma': {
			location: 'Sector-12',
			stockSymbol: 'FSIG',
			server: '4sigma',
			faction: 'Four Sigma',
			company: 'Four Sigma',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'KuaiGong International': {
			location: 'Chongqing',
			stockSymbol: 'KGI',
			server: 'kuai-gong',
			faction: 'KuaiGong International',
			company: 'KuaiGong International',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'Fulcrum Technologies': {
			location: 'Aevum',
			stockSymbol: 'FLCM',
			server: 'fulcrumtech',
			company: 'Fulcrum Technologies',
			companyPositions: ['Business', 'IT', 'Software']
		},
		'Storm Technologies': {
			location: 'Ishima',
			stockSymbol: 'STM',
			server: 'stormtech',
			company: 'Storm Technologies',
			companyPositions: ['Business', 'IT', 'Software Consultant', 'Software']
		},
		'DefComm': {
			location: 'New Tokyo',
			stockSymbol: 'DCOMM',
			server: 'defcomm',
			company: 'DefComm',
			companyPositions: ['IT', 'Software Consultant', 'Software']
		},
		'Helios Labs': {
			location: 'Volhaven',
			stockSymbol: 'HLS',
			server: 'helios',
			company: 'Helios Labs',
			companyPositions: ['IT', 'Software Consultant', 'Software']
		},
		'VitaLife': {
			location: 'New Tokyo',
			stockSymbol: 'VITA',
			server: 'vitalife',
			company: 'VitaLife',
			companyPositions: ['Business', 'IT', 'Software Consultant', 'Software']
		},
		'Icarus Microsystems': {
			location: 'Sector-12',
			stockSymbol: 'ICRS',
			server: 'icarus',
			company: 'Icarus Microsystems',
			companyPositions: ['Business', 'IT', 'Software Consultant', 'Software']
		},
		'Universal Energy': {
			location: 'Sector-12',
			stockSymbol: 'UNV',
			server: 'univ-energy',
			company: 'Universal Energy',
			companyPositions: ['Business', 'IT', 'Software Consultant', 'Software']
		},
		'AeroCorp': {
			location: 'Aevum',
			stockSymbol: 'AERO',
			server: 'aerocorp',
			company: 'AeroCorp',
			companyPositions: ['IT', 'Security', 'Software']
		},
		'Omnia Cybersystems': {
			location: 'Volhaven',
			stockSymbol: 'OMN',
			server: 'omnia',
			company: 'Omnia Cybersystems',
			companyPositions: ['IT', 'Security', 'Software']
		},
		'Solaris Space Systems': {
			location: 'Chongqing',
			stockSymbol: 'SLRS',
			server: 'solaris',
			company: 'Solaris Space Systems',
			companyPositions: ['IT', 'Security', 'Software']
		},
		'Global Pharmaceuticals': {
			location: 'New Tokyo',
			stockSymbol: 'GPH',
			server: 'global-pharm',
			company: 'Global Pharmaceuticals',
			companyPositions: ['Business', 'IT', 'Security', 'Software Consultant', 'Software']
		},
		'Nova Medical': {
			location: 'Ishima',
			stockSymbol: 'NVMD',
			server: 'nova-med',
			company: 'Nova Medical',
			companyPositions: ['Business', 'IT', 'Security', 'Software Consultant', 'Software']
		},
		'Watchdog Security': {
			location: 'Aevum',
			stockSymbol: 'WDS',
			company: 'Watchdog Security',
			companyPositions: ['Agent', 'IT', 'Security', 'Software Consultant', 'Software']
		},
		'LexoCorp': {
			location: 'Volhaven',
			stockSymbol: 'LXO',
			server: 'lexo-corp',
			company: 'LexoCorp',
			companyPositions: ['Business', 'IT', 'Security', 'Software Consultant', 'Software']
		},
		'Rho Construction': {
			location: 'Aevum',
			stockSymbol: 'RHOC',
			server: 'rho-construction',
			company: 'Rho Construction',
			companyPositions: ['Business', 'Software']
		},
		'Alpha Enterprises': {
			location: 'Sector-12',
			stockSymbol: 'APHE',
			server: 'alpha-ent',
			company: 'Alpha Enterprises',
			companyPositions: ['Business', 'Software Consultant', 'Software']
		},
		'SysCore Securities': {
			location: 'Volhaven',
			stockSymbol: 'SYSC',
			server: 'syscore',
			company: 'SysCore Securities',
			companyPositions: ['IT', 'Software']
		},
		'CompuTek': {
			location: 'Volhaven',
			stockSymbol: 'CTK',
			server: 'comptek',
			company: 'CompuTek',
			companyPositions: ['IT', 'Software']
		},
		'NetLink Technologies': {
			location: 'Aevum',
			stockSymbol: 'NTLK',
			server: 'netlink',
			company: 'NetLink Technologies',
			companyPositions: ['IT', 'Software']
		},
		'Omega Software': {
			location: 'Ishima',
			stockSymbol: 'OMGA',
			server: 'omega-net',
			company: 'Omega Software',
			companyPositions: ['IT', 'Software Consultant', 'Software']
		},
		'FoodNStuff': {
			location: 'Sector-12',
			stockSymbol: 'FNS',
			server: 'foodnstuff',
			company: 'FoodNStuff',
			companyPositions: ['Employee', 'part-time Employee']
		},
		'Sigma Cosmetics': {stockSymbol: 'SGC', server: 'sigma-cosmetics'},
		'Joe\'s Guns': {
			location: 'Sector-12',
			stockSymbol: 'JGN',
			server: 'joesguns',
			company: 'Joe\'s Guns',
			companyPositions: ['Employee', 'part-time Employee']
		},
		'Catalyst Ventures': {stockSymbol: 'CTYS', server: 'catalyst'},
		'Microdyne Technologies': {stockSymbol: 'MDYN', server: 'microdyne'},
		'Titan Laboratories': {stockSymbol: 'TITN', server: 'titan-labs'},
		'CyberSec': {server: 'CSEC', faction: 'CyberSec', factionWorkTypes: ['Hacking']},
		'The Runners': {server: 'run4theh111z', faction: 'BitRunners', factionWorkTypes: ['Hacking']},
		'Bachman & Associates': {
			location: 'Aevum',
			server: 'b-and-a',
			faction: 'Bachman & Associates',
			company: 'Bachman & Associates',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'Fulcrum Secret Technologies': {
			server: 'fulcrumassets',
			faction: 'Fulcrum Secret Technologies',
			factionWorkTypes: ['Hacking', 'Security']
		},
		'NiteSec': {server: 'avmnite-02h', faction: 'NiteSec', factionWorkTypes: ['Hacking'], gang: true},
		'I.I.I.I': {server: 'I.I.I.I', faction: 'The Black Hand', factionWorkTypes: ['Hacking', 'Field'], gang: true},
		'Slum Snakes': {faction: 'Slum Snakes', factionWorkTypes: ['Field', 'Security'], gang: true},
		'Tetrads': {faction: 'Tetrads', factionWorkTypes: ['Field', 'Security'], gang: true},
		'Speakers for the Dead': {
			faction: 'Speakers for the Dead',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			gang: true
		},
		'.': {server: '.', faction: 'The Dark Army', factionWorkTypes: ['Hacking', 'Field'], gang: true},
		'The Syndicate': {faction: 'The Syndicate', factionWorkTypes: ['Hacking', 'Field', 'Security'], gang: true},
		'Rothman University': {location: 'Sector-12', server: 'rothman-uni', university: 'Rothman University'},
		'ZB Institute of Technology': {
			location: 'Volhaven',
			server: 'zb-institute',
			university: 'ZB Institute of Technology'
		},
		'Summit University': {location: 'Aevum', server: 'summit-university', university: 'Summit University'},
		'Crush Fitness': {location: 'Aevum', server: 'crush-fitness', gym: 'Crush Fitness Gym'},
		'Millenium Fitness Network': {location: 'Volhaven', server: 'millenium-fitness', gym: 'Millenium Fitness Gym'},
		'Iron Gym Network': {location: 'Sector-12', server: 'iron-gym', gym: 'Iron Gym'},
		'Powerhouse Fitness': {location: 'Sector-12', server: 'powerhouse-fitness', gym: 'Powerhouse Gym'},
		'Snap Fitness': {location: 'Aevum', server: 'snap-fitness', gym: 'Snap Fitness Gym'},
		'Silhouette': {faction: 'Silhouette', factionWorkTypes: ['Hacking', 'Field']},
		'Tian Di Hui': {faction: 'Tian Di Hui', factionWorkTypes: ['Hacking', 'Security']},
		'Netburners': {faction: 'Netburners', factionWorkTypes: ['Hacking']},
		'Aevum': {
			location: 'Aevum',
			faction: 'Aevum',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			city: true
		},
		'Sector-12': {
			location: 'Sector-12',
			faction: 'Sector-12',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			city: true
		},
		'Chongqing': {
			location: 'Chongqing',
			faction: 'Chongqing',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			city: true
		},
		'New Tokyo': {
			location: 'New Tokyo',
			faction: 'New Tokyo',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			city: true
		},
		'Ishima': {
			location: 'Ishima',
			faction: 'Ishima',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			city: true
		},
		'Volhaven': {
			location: 'Volhaven',
			faction: 'Volhaven',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			city: true
		},
		'NWO': {
			location: 'Volhaven',
			server: 'nwo',
			faction: 'NWO',
			company: 'NWO',
			factionWorkTypes: ['Hacking', 'Field', 'Security'],
			companyPositions: ['Business', 'IT', 'Security', 'Software']
		},
		'Delta One': {
			location: 'Sector-12',
			server: 'deltaone',
			company: 'Delta One',
			companyPositions: ['IT', 'Security', 'Software']
		},
		'Central Intelligence Agency': {
			location: 'Sector-12',
			company: 'Central Intelligence Agency',
			companyPositions: ['Agent', 'IT', 'Security', 'Software']
		},
		'National Security Agency': {
			location: 'Sector-12',
			company: 'National Security Agency',
			companyPositions: ['Agent', 'IT', 'Security', 'Software']
		},
		'Aevum Police Headquarters': {
			location: 'Aevum', server: 'aevum-police',
			company: 'Aevum Police Headquarters',
			companyPositions: ['Security', 'Software']
		},
		'Carmichael Security': {
			location: 'Sector-12',
			company: 'Carmichael Security',
			companyPositions: ['Agent', 'IT', 'Security', 'Software Consultant', 'Software']
		},
		'Galactic Cybersystems': {
			location: 'Aevum', server: 'galactic-cyber',
			company: 'Galactic Cybersystems',
			companyPositions: ['Business', 'IT', 'Software Consultant', 'Software']
		},
		'Noodle Bar': {
			location: 'New Tokyo', server: 'n00dles',
			company: 'Noodle Bar',
			companyPositions: ['Waiter', 'part-time Waiter']
		},
		'InfoComm': {server: 'infocomm'},
		'Taiyang Digital': {server: 'taiyang-digital'},
		'ZB Defense Industries': {server: 'zb-def'},
		'Applied Energetics': {server: 'applied-energetics'},
		'Zeus Medical': {server: 'zeus-med'},
		'UnitaLife Group': {server: 'unitalife'},
		'The Hub': {server: 'the-hub'},
		'Johnson Orthopedics': {server: 'johnson-ortho'},
		'ZER0 Nightclub': {server: 'zero'},
		'Nectar Nightclub Network': {server: 'nectar-net'},
		'Neo Nightclub Network': {server: 'neo-net'},
		'Silver Helix': {server: 'silver-helix'},
		'HongFang Teahouse': {server: 'hong-fang-tea'},
		'HaraKiri Sushi Bar Network': {server: 'harakiri-sushi'},
		'Phantasy Club': {server: 'phantasy'},
		'Max Hardware Store': {server: 'max-hardware'},
		'Helios': {server: 'The-Cave'},
		'w0r1d_d43m0n': {server: 'w0r1d_d43m0n'},
		'The Covenant': {faction: 'The Covenant', factionWorkTypes: ['Hacking', 'Field']},
		'Daedalus': {faction: 'Daedalus', factionWorkTypes: ['Hacking', 'Field']},
		'Illuminati': {faction: 'Illuminati', factionWorkTypes: ['Hacking', 'Field']},
		'Iker Molina Casino': {location: 'Aevum'},
		'Sector-12 City Hall': {location: 'Sector-12'},
		'Arcade': {location: 'New Tokyo'},
		'0x6C1': {location: 'Ishima'},
		'Hospital': {general: true},
		'The Slums': {general: true},
		'Travel Agency': {general: true},
		'World Stock Exchange': {general: true},
		'Bladeburners': {location: 'Sector-12', faction: 'Bladeburners'},
		'Church of the Machine God': {location: 'Chongqing', faction: 'Church of the Machine God'},
		'Shadows of Anarchy': {faction: 'Shadows of Anarchy'}
	};
}

/**
 *
 * @return {string[]}
 */
export function getFactions() {
	return Object.values(getOrganisations()).filter(v => v.faction).map(v => v.faction);
}

/**
 *
 * @return {string[]}
 */
export function getCompanies() {
	return Object.values(getOrganisations()).filter(v => v.company).map(v => v.company);
}

/**
 *
 * @return {string[]}
 */
export function getGangs() {
	return Object.values(getOrganisations()).filter(v => v.gang).map(v => v.faction);
}

/**
 *
 * @returns {string[]}
 */
export function getCities() {
	return Object.values(getOrganisations()).filter(v => v.city).map(v => v.location);
}

/**
 *
 * @return {string[]}
 */
export function getGyms() {
	return Object.values(getOrganisations()).filter(v => v.gym).map(v => v.gym);
}

/**
 *
 * @return {string[]}
 */
export function getUniversities() {
	return Object.values(getOrganisations()).filter(v => v.university).map(v => v.university);
}

/**
 *
 * @param {string} faction
 * @returns {string[]}
 */
export function getFactionWorktypes(faction) {
	return Object.values(getOrganisations()).find(v => v.faction === faction).factionWorkTypes;
}

/**
 *
 * @param {string} faction
 * @returns {string[]}
 */
export function getCompanyPositions(company) {
	return Object.values(getOrganisations()).find(v => v.company === company).companyPositions;
}

/**
 *
 * @param {string} symbol
 * @returns {string}
 */
export function symbolToServer(symbol) {
	for (const v of Object.values(getOrganisations())) if (v.stockSymbol === symbol) return v.server;
}

/**
 *
 * @param {string} gym
 * @return {string}
 */
export function getGymLocation(gym) {
	for (const v of Object.values(getOrganisations())) if (v.gym === gym) return v.location;
}

/**
 *
 * @param {string} university
 * @return {string}
 */
export function getUniversityLocation(university) {
	for (const v of Object.values(getOrganisations())) if (v.university === university) return v.location;
}

/**
 *
 * @return {string[]}
 */
export function getCrimes() {
	return ['shoplift', 'rob', 'mug', 'larceny', 'drugs', 'bond', 'traffic', 'homicide', 'grand', 'kidnap',
		'assassinate', 'heist'];
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
	const [freeRams, filteredHackables] = getFreeRams(ns, servers, hackables);
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
		values.push(`${formatMoney(ns, ns.getTotalScriptIncome()[0])}`);
		headers.push(`Karma`);
		values.push(`${formatNumber(ns, ns.heart.break())}`);
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
	for (let s of serverList) ns.scan(s).filter(n => !serverList.includes(n)).forEach(n => serverList.push(n));
	return serverList;
}

/**
 *
 * @param {NS} ns
 * @param {string} server
 * @returns {boolean}
 */
export function hackServer(ns, server) {
	if (ns.getServerRequiredHackingLevel(server) > ns.getHackingLevel()) return false;
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
	if (ns.getServerNumPortsRequired(server) <= portOpened) {
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
			const threadsForThisHost = Math.floor(ram / scriptRam);
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
 * @returns {Object<string, number>[] | [Object<string, number>[], string[]]}
 */
export function getFreeRams(ns, servers, hackables) {
	const scripts = getScripts();
	const freeRams = [];
	const unhackables = [];
	for (const server of servers) {
		if (hackables && ns.scriptRunning(scripts.batcher, server)) { // Check if we have a batcher running on this server
			const process = ns.ps(server).find(s => s.filename === scripts.batcher); // Find the process of the batcher
			unhackables.push(process.args[0]); // Don't hack the target of the batcher
			continue; // Don't run scripts on the host
		}
		const freeRam = getFreeRam(ns, server);
		if (freeRam > 0) freeRams.push({host: server, freeRam: freeRam});
	}
	const sortedFreeRams = freeRams.sort((a, b) => b.freeRam - a.freeRam);
	if (hackables) {
		const filteredHackables = hackables.filter(hackable => !unhackables.includes(hackable));
		return [sortedFreeRams, filteredHackables];
	}
	return sortedFreeRams;
}

/**
 *
 * @param {NS} ns
 * @param {string} server
 * @return {number}
 */
export function getFreeRam(ns, server, ignoreNonManagerScripts = false) {
	const data = readFromFile(ns, getPortNumbers().reservedRam);
	const reservedRam = (data[server] ?? [{'ram': 0}]).reduce((a, b) => a + b.ram, 0);
	let freeRam = ns.getServerMaxRam(server) - ns.getServerUsedRam(server) - reservedRam;
	if (ignoreNonManagerScripts) {
		const managerScripts = getManagerScripts();
		ns.ps(server).forEach(p => {
			const script = p.filename;
			if (!managerScripts.includes(script)) freeRam += ns.getScriptRam(script, server) * p.threads;
		});
	}
	return freeRam;
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
export function getCracks() {
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
 * @returns {string[]}
 */
export function getUsefulPrograms() {
	return ['ServerProfiler.exe', 'AutoLink.exe', 'DeepscanV1.exe', 'DeepscanV2.exe'];
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
		'/augmentations/install.js',
		'/augmentations/purchase.js',
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
export function enoughRam(ns, script, server = ns.getHostname(), threads = 1) {
	return ns.getScriptRam(script, server) * threads <= getFreeRam(ns, server);
}

/**
 *
 * @returns {Object<number>}
 */
export function getPortNumbers() {
	return {
		general: 0,
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
		case 0:
			return {bitnodeN: 1, contractor: true};
		case 1:
			return {'home': [{'ram': 64, 'server': 'DEF', 'pid': 'DEF'}]};
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
			return {long: [], short: []};
		case 9:
			return undefined;
		case 10:
			return Object.fromEntries(Array.from({length: 8}, (_, i) =>
				[i, {
					autopilot: true,
					usefulCombat: false,
					usefulHacking: false,
					usefulFaction: false,
					usefulCompany: false
				}]));
		case 11:
			return undefined;
		case 12:
			return undefined;
		case 13:
			return {pattern: 'starter', maxCharges: 50};
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
	const bitnodeData = readFromFile(ns, 0);
	for (let i = 1; i <= 20; i++)
		if (ns.getPlayer().bitNodeN !== bitnodeData.bitNodeN || !ns.fileExists(`/data/${i}.txt`))
			await writeToFile(ns, i, defaultPortData(i));
	await writeToFile(ns, 0, {bitnodeN: ns.getPlayer().bitNodeN});
}

/**
 *
 * @param {NS} ns
 * @param {number} portNumber
 * @return {Promise<void>}
 */
export async function resetData(ns, portNumber) {
	await writeToFile(ns, portNumber, defaultPortData(portNumber));
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
export async function writeToFile(ns, portNumber, data, mode = 'w') {
	if (typeof data !== 'string') data = JSON.stringify(data);
	await ns.write(getFileHandle(portNumber), data, mode);
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
	const updatedData = recursiveModify(data, dataToModify);
	await writeToFile(ns, portNumber, updatedData, mode);
}

/**
 *
 * @param {Object<*>} data
 * @param {Object<*>} dataToModify
 * @returns {Object<*>}
 */
function recursiveModify(data, dataToModify) {
	for (const [key, val] of Object.entries(dataToModify)) {
		if (typeof val === 'object' && !Array.isArray(val) && data[key]) {
			const _data = data[key];
			recursiveModify(_data, val);
			data[key] = _data;
		} else data[key] = val;
	}
	return data;
}

/**
 *
 * @param {NS} ns
 * @param {string} server
 * @param {ram} number
 * @returns {Promise<void>}
 */
export async function reserveRam(ns, server, ram) {
	const portNumber = getPortNumbers().reservedRam;
	const data = readFromFile(ns, portNumber);
	const updatedData = data[server] ?? [];
	updatedData.push({'ram': ram, 'server': ns.getRunningScript().server, 'pid': ns.getRunningScript().pid});
	const dataToModify = {[server]: updatedData};
	await modifyFile(ns, portNumber, dataToModify);
}

/**
 *
 * @param {NS} ns
 * @param {string} server
 * @returns {Promise<void>}
 */
export async function unreserveRam(ns, server) {
	const portNumber = getPortNumbers().reservedRam;
	const scriptHost = ns.getRunningScript().server;
	const pid = ns.getRunningScript().pid;
	const data = readFromFile(ns, portNumber);
	const updatedData = data[server].filter(e => e.server !== scriptHost || e.pid !== pid);
	const dataToModify = {[server]: updatedData};
	await modifyFile(ns, portNumber, dataToModify);
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function updateReservedRam(ns) {
	const portNumber = getPortNumbers().reservedRam;
	const data = readFromFile(ns, portNumber);
	const updatedData = {};
	Object.entries(data).forEach(([k, v]) => updatedData[k] = v.filter(e => e.pid === 'DEF' || ns.ps(e.server).some(s => s.pid === e.pid)));
	await writeToFile(ns, portNumber, updatedData);
}

/**
 *
 * @param {NS} ns
 * @param {number} n
 * @return {string}
 */
export function formatNumber(ns, n) {
	return isNaN(n) ? 'NaN' : ns.nFormat(n, '0.000a');
}

/**
 *
 * @param {NS} ns
 * @param {number} n
 * @return {string}
 */
export function formatMoney(ns, n) {
	return isNaN(n) ? 'NaN' : ns.nFormat(n, '$0.000a');
}

/**
 *
 * @param {NS} ns
 * @param {number} b
 * @return {string}
 */
export function formatRam(ns, b) {
	return isNaN(b) ? 'NaN' : ns.nFormat(b * 1e9, '0.00b');
}

/**
 *
 * @param {number} n
 * @param {number} round
 * @return {string}
 */
export function formatPercentage(n, round = 2) {
	return isNaN(n) ? 'NaN%' : `${(n * 100).toFixed(round)}%`;
}

/**
 *
 * @param {NS} ns
 * @param {number} t
 * @param {boolean} milliPrecision
 * @return {string}
 */
export function formatTime(ns, t, milliPrecision = false) {
	return isNaN(t) ? 'NaN' : ns.tFormat(t, milliPrecision);
}
