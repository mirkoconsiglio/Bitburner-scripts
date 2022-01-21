export async function main(ns) {
	const mults = ns.getBitNodeMultipliers();
	for (let [mult, val] of Object.entries(mults)) {
		ns.tprint(`${mult}: ${val}`);
	}
}