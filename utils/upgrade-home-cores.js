export async function main(ns) {
	if (await ns.prompt(`Upgrade home Cores?`)) {
		if (ns.upgradeHomeCores()) ns.tprint(`Home cores upgraded.`);
		else ns.tprint(`Could not upgrade home cores.`);
	}
}