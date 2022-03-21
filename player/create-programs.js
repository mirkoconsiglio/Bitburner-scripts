/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const programs = ['ServerProfiler.exe', 'DeepscanV1.exe', 'DeepscanV2.exe', 'AutoLink.exe'];
	for (let program of programs) {
		if (ns.createProgram(program)) {
			while (ns.isBusy()) {
				await ns.sleep(1000);
			}
			ns.tprint(`${program} created.`)
		} else ns.tprint(`${program} already owned.`);
	}
}