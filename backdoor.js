import {hackServer, routeFinder} from 'utils.js';

export async function main(ns) {
	let server = ns.args[0];
	let route = routeFinder(ns, server);
	if (route) {
		if (hackServer(ns, server)) {
			for (let serv of route) {
				ns.connect(serv);
			}
			await ns.installBackdoor();
			ns.tprint(`Backdoor installed on ${server}.`);
			for (let serv of route.reverse()) {
				ns.connect(serv);
			}
		}
		return true;
	}
	return false;
}

export function autocomplete(data) {
	return data.servers;
}