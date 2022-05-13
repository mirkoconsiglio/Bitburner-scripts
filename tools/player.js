/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	for (let [key, val] of Object.entries(ns.getPlayer())) {
		if (key === 'jobs') {
			ns.tprint('jobs:');
			for (const [i, j] of Object.entries(val)) ns.tprintf(`\t${i}: ${j}`);
		} else ns.tprint(`${key}: ${val}`);
	}
}