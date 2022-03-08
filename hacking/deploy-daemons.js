import {getAccessibleServers, getOptimalHackable, getScripts} from '/utils/utils.js';

export async function main(ns) {
	deployDaemons(ns);
}

export function deployDaemons(ns, minimumRam = 2 ** 14) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);
	// filter and sort servers according to RAM
	const hosts = servers.filter(server => ns.getServerMaxRam(server) >= minimumRam).sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a));
	// Deploy daemons
	let c = 0;
	for (let host of hosts) {
		if (c === hackables.length) break; // If we run out of hackable servers break
		if (!ns.isRunning(scripts.daemon, host, hackables[c])) {
			ns.scriptKill(scripts.daemon, host);
			ns.exec(scripts.daemon, host, 1, hackables[c]);
			c++;
		}
	}
}