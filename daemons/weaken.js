/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const [target, delay] = ns.args;
	if (delay) await ns.sleep(delay);
	await ns.weaken(target);
}