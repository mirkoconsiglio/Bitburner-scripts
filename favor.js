/** @param {NS} ns **/
export async function main(ns) {
	let favor = 1 + Math.floor(Math.log((ns.args[0] + 25000) / 25500) / Math.log(1.02));
	ns.tprint(favor);
}