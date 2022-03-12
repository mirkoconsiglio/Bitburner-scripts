/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.tprint(ns.nFormat(Math.ceil(25500 * Math.exp(Math.log(1.02) * (ns.args[0] - 1)) - 25000), '0.000a'));
}