import {getAccessibleServers, getOptimalHackable, getScripts} from '/utils/utils.js';

export async function main(ns) {
	deployDaemons(ns);
}

export function deployDaemons(ns) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);
	const minimumRam = 2 ** 14; // 16 TiB
	// filter and sort servers according to RAM
	servers.filter(server => ns.getServerMaxRam(server) >= minimumRam).sort((a, b) => ns.getServerMaxRam(b) - ns.getServerMaxRam(a));
	// Deploy daemons
	let c = 0;
	for (let server of servers) {
		if (c === hackables.length) break; // If we run out of hackable servers break
		if (!ns.isRunning(scripts.daemon, server, hackables[c])) {
			ns.scriptKill(scripts.daemon, server);
			ns.exec(scripts.daemon, server, 1, hackables[c]);
			c++;
		}
	}
}