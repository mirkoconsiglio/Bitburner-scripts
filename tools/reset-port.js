import {initData, resetData} from '/utils.js';

const argsSchema = [
	['all', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, args) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @return {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	options.all ? await initData(ns) : await resetData(ns, options_[0]);
}