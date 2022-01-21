export async function main(ns) {
	const reputation = Math.ceil(25500 * Math.exp(Math.log(1.02) * (ns.args[0] - 1)) - 25000);
	ns.tprint(ns.nFormat(reputation, '0.000a'));
}