import {formatMoney} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const cost = ns.singularity.getUpgradeHomeRamCost();
	if (await ns.prompt(`Upgrade home RAM for ${formatMoney(ns, cost)}?`)) {
		if (ns.singularity.upgradeHomeRam()) ns.tprint(`Home RAM upgraded.`);
		else ns.tprint(`Could not upgrade home RAM.`);
	}
}