/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const programs = ['ServerProfiler.exe', 'DeepscanV1.exe', 'DeepscanV2.exe', 'AutoLink.exe'];
	for (const program of programs) {
		while (!ns.fileExists(program, 'home')) {
			ns.createProgram(program, ns.isFocused());
			await ns.sleep(1000);
		}
		ns.tprint(`${program} created`);
	}
}