import {getAccessibleServers, getOptimalHackable, getScripts, scriptsToCopy} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const power = ns.args[0];
	const servers = getAccessibleServers(ns);
	const hackables = getOptimalHackable(ns, servers);
	const targetRam = Math.pow(2, power);
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
		// Run daemon if server RAM >= 16 TiB
		if (power > 14) ns.exec(getScripts().daemon, server, 1, hackables[i + 1]);
	}
}