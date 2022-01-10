import {getAccessibleServers, getOptimalHackable, getScripts} from '/utils/utils.js';

export async function main(ns) {
	let scripts = getScripts();
	let servers = getAccessibleServers(ns);
	let hackables = getOptimalHackable(ns, servers);
	let runOnHome = ns.args[0] ? ns.args[0] : 1;

	if (ns.scriptRunning(scripts.daemon, 'home')) ns.scriptKill('daemon.js', 'home');
	for (let i = 0; i < runOnHome; i++) {
		ns.exec(scripts.daemon, 'home', 1, hackables[i]);
	}

	for (let [i, host] of ns.getPurchasedServers().entries()) {
		if (i < hackables.length) {
			if (ns.scriptRunning(scripts.daemon, host)) ns.scriptKill('daemon.js', host);
			else ns.killall(host);
			ns.exec(scripts.daemon, host, 1, hackables[i + runOnHome]);
		} else break;
	}
}