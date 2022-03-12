/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const mults = ns.getBitNodeMultipliers();
	for (let [mult, val] of Object.entries(mults)) {
		ns.tprint(`${mult}: ${val}`);
	}
}