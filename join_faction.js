export async function main(ns, faction) {
	if (await ns.prompt(`Join ${faction}?`)) ns.joinFaction(faction);
}