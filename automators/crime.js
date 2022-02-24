export async function main(ns) {
	// noinspection InfiniteLoopJS
	while (true) {
		ns.tail(); // Necessary to exit script
		await ns.sleep(ns.commitCrime(ns.args[0]) + 100);
	}
}