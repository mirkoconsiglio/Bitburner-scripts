import {getAccessibleServers, getOptimalHackable, getScripts} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	deployDaemons(ns);
}

/**
 *
 * @param {NS} ns
 * @param {number} minimumRam
 */
export function deployDaemons(ns, minimumRam = 2 ** 14) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);
	// filter and sort servers according to RAM
	const hosts = servers.filter(server => ns.getServerMaxRam(server) >= minimumRam).sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a));
	// Deploy daemons
	for (let i = 0; i < Math.min(hosts.length, hackables.length); i++) {
		if (!ns.isRunning(scripts.daemon, hosts[i], hackables[i])) {
			ns.scriptKill(scripts.daemon, hosts[i]);
			ns.exec(scripts.daemon, hosts[i], 1, hackables[i]);
		}
	}
}