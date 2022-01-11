export async function main(ns) {
	for (let faction of ns.args) {
		if (await ns.prompt(`Join ${faction}?`)) ns.joinFaction(faction);
	}
}