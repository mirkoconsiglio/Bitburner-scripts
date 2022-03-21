/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const moneyThreshold = 1e9;
	// noinspection InfiniteLoopJS
	while (true) {
		ns.tail();
		while (ns.getPlayer().money > moneyThreshold) {
			ns.travelToCity('Aevum');
			ns.travelToCity('Sector-12');
			await ns.sleep(100);
		}
		await ns.sleep(1000);
	}
}