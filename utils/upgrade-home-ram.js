export async function main(ns, cost) {
	if (await ns.prompt(`Upgrade home RAM for ${ns.nFormat(cost, '$0.000a')}?`)) {
		if (ns.upgradeHomeRam()) ns.tprint(`Home RAM upgraded.`);
		else ns.tprint(`Could not upgrade home RAM.`);
	}
}