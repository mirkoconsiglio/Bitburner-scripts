export async function main(ns) {
	let faction = ns.args[0];
	if (await ns.prompt(`Join ${faction}?`)) ns.joinFaction(faction);
}