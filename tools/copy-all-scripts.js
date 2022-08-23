export function autocomplete(data) {
	return data.servers;
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	for (const script of ns.read('/build/scripts.txt').split('\n'))
		await ns.scp(script.includes('/') ? '/' + script : script, ns.args[0], 'home');
}