import {resetData} from '/utils.js';

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
	if (!options.all && options._.length === 0) throw new Error(`Must specify which port(s) or --all`);
	if (options.all) for (let i = 1; i <= 20; i++) await resetData(ns, i);
	else for (let i of options._) await resetData(ns, i);
}