import {formatMoney} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const cost = ns.singularity.getUpgradeHomeCoresCost();
	if (await ns.prompt(`Upgrade home Cores for ${formatMoney(ns, cost)}?`)) {
		if (ns.singularity.upgradeHomeCores()) ns.tprint(`Home cores upgraded.`);
		else ns.tprint(`Could not upgrade home cores.`);
	}
}