import {getScripts} from 'utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		[moneyThreshold, 1e9],
		[threads, 1],
		[host, ns.getHostname()]
	]);
	const scripts = getScripts();
	for (let i = 0; i < args.threads; i++) ns.exec(scripts.intelligence, args.host, 1, args.moneyThreshold, i);
}
