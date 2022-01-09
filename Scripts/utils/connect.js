import {routeFinder} from './utils';

export async function main(ns) {
	let server = ns.args[0];
	let route = routeFinder(ns, server);
	if (route) {
		for (let serv of route) {
			ns.connect(serv);
		}
	}
}

export function autocomplete(data) {
	return data.servers;
}