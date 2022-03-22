import {getPortNumbers, modifyFile} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['pattern', undefined],
		['maxCharges', undefined]
	]);
	const dataToModify = {};
	if (args.pattern) dataToModify.pattern = args.pattern;
	if (args.maxCharges) dataToModify.maxCharges = args.maxCharges;
	await modifyFile(ns, getPortNumbers().stanek, dataToModify);
}