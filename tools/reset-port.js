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
	ns.tprint(options._);
	if (!options.all && options._.length === 0) throw new Error(`Must specify which port or --all`);
	options.all ? await initData(ns) : await resetData(ns, options._[0]);
}