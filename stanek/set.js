import {getPortNumbers, modifyFile} from '/utils.js';

const argsSchema = [
	['pattern', undefined],
	['maxCharges', undefined]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, args) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	const dataToModify = {};
	if (options.pattern) dataToModify.pattern = options.pattern;
	if (options.maxCharges) dataToModify.maxCharges = options.maxCharges;
	await modifyFile(ns, getPortNumbers().stanek, dataToModify);
}