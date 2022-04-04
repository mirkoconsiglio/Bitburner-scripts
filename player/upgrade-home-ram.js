import {formatMoney} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const cost = ns.getUpgradeHomeRamCost();
	if (await ns.prompt(`Upgrade home RAM for ${formatMoney(ns, cost)}?`)) {
		if (ns.upgradeHomeRam()) ns.tprint(`Home RAM upgraded.`);
		else ns.tprint(`Could not upgrade home RAM.`);
	}
}