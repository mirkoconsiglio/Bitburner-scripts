import {scriptsToCopy} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const power = ns.args[0];
	const targetRam = Math.pow(2, power);
	for (let i = 0; i < ns.getPurchasedServerLimit(); i++) {
		const server = 'pserv-' + i;
		const cost = ns.getPurchasedServerCost(targetRam);
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
		await ns.scp(scriptsToCopy(), server, 'home');
	}
}