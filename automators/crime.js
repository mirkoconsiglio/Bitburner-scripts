export async function main(ns) {
	const crime = ns.args[0];
	const interval = 100;
	while (true) {
		ns.tail(); // Necessary to exit script
		await ns.sleep(ns.commitCrime(crime) + interval);
	}
}