import {getPortNumbers, readFromFile} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const [target, delay] = ns.args;
	const data = readFromFile(ns, getPortNumbers().stock).long;
	const stock = data.includes(target);
	if (delay) await ns.sleep(delay);
	await ns.grow(target, {stock: stock});
}