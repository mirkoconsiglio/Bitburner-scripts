import {routeFinder} from '/utils/utils.js';

export async function main(ns) {
	const server = ns.args[0];
	const route = routeFinder(ns, server);
	if (route) {
		for (let serv of route) {
			ns.connect(serv);
		}
	}
}

// noinspection JSUnusedGlobalSymbols
export function autocomplete(data) {
	// noinspection JSUnresolvedVariable
	return data.servers;
}