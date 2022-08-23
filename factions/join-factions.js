/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	for (let faction of ns.args) {
		if (await ns.prompt(`Join ${faction}?`)) ns.singularity.joinFaction(faction);
	}
}