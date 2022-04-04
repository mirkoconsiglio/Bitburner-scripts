import {formatNumber} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.tprint(formatNumber(ns, Math.ceil(25500 * Math.exp(Math.log(1.02) * (ns.args[0] - 1)) - 25000)));
}