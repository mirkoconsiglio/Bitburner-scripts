import {getAccessibleServers, getOptimalHackable, getScripts, scriptsToCopy} from '/utils/utils.js';

export async function main(ns) {
	let power = ns.args[0];

	if (power < 0 || power > 20) {
		ns.tprint(`Invalid RAM amount.`);
		ns.exit();
	}

	let servers = getAccessibleServers(ns);
	let hackables = getOptimalHackable(ns, servers);

	let targetRam = Math.pow(2, power);
	for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
		let server = 'pserv-' + i;
		let cost = ns.getPurchasedServerCost(targetRam);
		while (ns.getServerMoneyAvailable('home') < cost) {
			await ns.sleep(1000);
		}
		if (ns.serverExists(server)) {
			if (ns.getServerMaxRam(server) < targetRam) {
				ns.killall(server);
				ns.deleteServer(server);
			} else continue;
		}
		ns.tprint(`Buying server: ${server}, target RAM: ${targetRam}`);
		ns.purchaseServer(server, targetRam);
		await ns.scp(scriptsToCopy(), 'home', server);
		ns.exec(getScripts().daemon, server, 1, hackables[i + 1]);
	}
}