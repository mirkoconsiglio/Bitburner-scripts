import {getAccessibleServers, getOptimalHackable, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);

	if (ns.scriptRunning(scripts.daemon, 'home')) ns.scriptKill(scripts.daemon, 'home');
	ns.exec(scripts.daemon, 'home', 1, hackables[0]);

	for (let [i, host] of ns.getPurchasedServers().entries()) {
		if (i < hackables.length) {
			if (ns.scriptRunning(scripts.daemon, host)) ns.scriptKill(scripts.daemon, host);
			else ns.killall(host);
			ns.exec(scripts.daemon, host, 1, hackables[i + 1]);
		} else break;
	}
}