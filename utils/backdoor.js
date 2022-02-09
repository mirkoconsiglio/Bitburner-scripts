import {hackServer, routeFinder} from '/utils/utils.js';

export async function main(ns) {
	const server = ns.args[0];
	const route = routeFinder(ns, server);
	if (route && hackServer(ns, server)) {
		for (let serv of route) {
			ns.connect(serv);
		}
		await ns.installBackdoor();
		for (let serv of route.reverse()) {
			ns.connect(serv);
		}
	}
}

export function autocomplete(data) {
	return data.servers;
}