export async function main(ns) {
	while (true) {
		ns.tail(); // Necessary to exit script
		await ns.sleep(ns.commitCrime(ns.args[0]) + 100);
	}
}