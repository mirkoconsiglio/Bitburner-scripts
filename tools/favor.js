/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.tprint(1 + Math.floor(Math.log((ns.args[0] + 25000) / 25500) / Math.log(1.02)));
}