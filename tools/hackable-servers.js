import {getAccessibleServers, getOptimalHackable, targetCost} from '/utils/utils.js';

export async function main(ns) {
	const args = ns.flags([['cores', 1]]);
	const servers = getAccessibleServers(ns);
	const hackable = getOptimalHackable(ns, servers);
	for (let [i, server] of hackable.entries()) {
		const growth = ns.getServerGrowth(server);
		const money = ns.nFormat(ns.getServerMaxMoney(server), '0.000a');
		const minSec = ns.getServerMinSecurityLevel(server);
		const cost = ns.nFormat(targetCost(ns, server, args.cores), '0.000a');
		ns.tprintf(`${i + 1}: Maximum Money: ${money}, Growth: ${growth}, Min Security: ${minSec}, Server: ${host}, Cost: ${cost}`);
	}
}