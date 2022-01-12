export async function main(ns) {
	let cost = ns.getUpgradeHomeCoresCost();
	if (await ns.prompt(`Upgrade home Cores for ${ns.nFormat(cost, '$0.000a')}?`)) {
		if (ns.upgradeHomeCores()) ns.tprint(`Home cores upgraded.`);
		else ns.tprint(`Could not upgrade home cores.`);
	}
}