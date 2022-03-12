import {getDefaultData} from '/stanek/utils.js';
import {getPorts} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['pattern', undefined],
		['maxCharges', undefined],
		['host', undefined],
		['reservedRam', undefined]
	]);
	const port = ns.getPortHandle(getPorts().stanek);
	let data = port.read();
	if (data === 'NULL PORT DATA') data = getDefaultData();
	if (args.pattern) data.pattern = args.pattern;
	if (args.maxCharges) data.maxCharges = args.maxCharges;
	if (args.host) data.host = args.host;
	if (args.reservedRam) data.reservedRam = args.reservedRam;
	port.tryWrite(data);
}