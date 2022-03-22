import {getPortNumbers, modifyFile} from '/utils.js';

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
	const dataToModify = {};
	if (args.pattern) dataToModify.pattern = args.pattern;
	if (args.maxCharges) dataToModify.maxCharges = args.maxCharges;
	if (args.host) dataToModify.host = args.host;
	if (args.reservedRam) dataToModify.reservedRam = args.reservedRam;
	await modifyFile(ns, getPortNumbers().stanek, dataToModify);
}