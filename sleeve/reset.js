import {getDefaultSleeveData} from '/sleeve/utils.js';
import {getPorts} from 'utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const port = ns.getPortHandle(getPorts().sleeve);
	port.clear();
	port.write(getDefaultSleeveData());
}