import {getAccessibleServers, getOptimalHackable} from '/utils/utils.js';;

export async function main(ns) {
	let servers = getAccessibleServers(ns);
	let hackable = getOptimalHackable(ns, servers);
	for (let [i, host] of hackable.entries()) {
		let growth = ns.getServerGrowth(host);
		let money = ns.nFormat(ns.getServerMaxMoney(host), "0.000a");
		let minSec = ns.getServerMinSecurityLevel(host);
		ns.tprint(`${i + 1}: Maximum Money: ${money}, Growth: ${growth}, Min Security: ${minSec}, Server: ${host}`);
	}
}