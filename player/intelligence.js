import {getScripts} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['moneyThreshold', 1e9],
		['threads', 1],
		['host', ns.getHostname()]
	]);
	const moneyThreshold = args.moneyThreshold;
	const threads = args.threads;
	const host = args.host;
	const script = getScripts().intelligence;
	for (let i = 0; i < threads; i++) ns.exec(script, host, 1, moneyThreshold, i);
}
