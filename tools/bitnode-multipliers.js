/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	for (const [mult, val] of Object.entries(ns.getBitNodeMultipliers())) ns.tprint(`${mult}: ${val}`);
}