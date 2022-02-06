import {getAccessibleServers, getOptimalHackable, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);
	// Daemons on home
	if (!ns.isRunning(scripts.daemon, 'home', hackables[0])) {
		ns.scriptKill(scripts.daemon, 'home');
		ns.exec(scripts.daemon, 'home', 1, hackables[0]);
	}
	// Daemons on purchased servers
	for (let [i, host] of ns.getPurchasedServers().entries()) {
		if (i < hackables.length) {
			if (!ns.isRunning(scripts.daemon, host, hackables[i + 1])) {
				ns.scriptKill(scripts.daemon, host);
				ns.exec(scripts.daemon, 'home', 1, hackables[i + 1]);
			}
		} else break;
	}
}