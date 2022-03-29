/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	await ns.stanek.chargeFragment(ns.args[0], ns.args[1]);
}