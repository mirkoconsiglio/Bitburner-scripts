import {getAccessibleServers, getOptimalHackable} from 'utils.js';

export async function main(ns) {
	let servers = getAccessibleServers(ns);
	let hackables = getOptimalHackable(ns, servers);
	let runOnHome = ns.args[0] ? ns.args[0] : 1;
	
	if (ns.scriptRunning('daemon.js', 'home')) ns.scriptKill('daemon.js', 'home');
	for (let i = 0; i < runOnHome; i++) {
		ns.exec('daemon.js', 'home', 1, hackables[i]);
	}
	
	for (let [i, host] of ns.getPurchasedServers().entries()) {
		if (i < hackables.length) {
			if (ns.scriptRunning('daemon.js', host)) ns.scriptKill('daemon.js', host);
			else ns.killall(host);
			ns.exec('daemon.js', host, 1, hackables[i + runOnHome]);
		} else break;
	}
}