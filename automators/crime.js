export async function main(ns) {
	const inc = 100;
	while (!ns.isBusy()) {
		const duration = ns.commitCrime(ns.args[0]);
		for (let i = 0; i < duration - 5 * inc; i += inc) {
			await ns.sleep(inc);
			if (!ns.isBusy()) return;
		}
		await ns.sleep(10 * inc);
	}
}