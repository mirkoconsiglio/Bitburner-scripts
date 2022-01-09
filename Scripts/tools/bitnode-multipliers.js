export async function main(ns) {
	let mults = ns.getBitNodeMultipliers();
	for (let [mult, val] of Object.entries(mults)) {
		ns.tprint(`${mult}: ${val}`);
	}
}