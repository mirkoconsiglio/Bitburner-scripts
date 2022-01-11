export async function main(ns) {
	if (await ns.prompt(`Upgrade home RAM?`)) {
		if (ns.upgradeHomeRam()) ns.tprint(`Home RAM upgraded.`);
		else ns.tprint(`Could not upgrade home RAM.`);
	}
}