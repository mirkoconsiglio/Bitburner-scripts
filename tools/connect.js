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

export function autocomplete(data) {
	return data.servers;
}