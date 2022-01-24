import {getAccessibleServers, getOptimalHackable, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const scripts = getScripts();
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);

	for (let script of Object.values(scripts)) {
		ns.scriptKill(script, 'home');
	}
	ns.exec(scripts.daemon, 'home', 1, hackables[0]);

	for (let [i, host] of ns.getPurchasedServers().entries()) {
		if (i < hackables.length) {
			for (let script of Object.values(scripts)) {
				ns.scriptKill(script, host);
			}
			ns.exec(scripts.daemon, host, 1, hackables[i + 1]);
		} else break;
	}
}