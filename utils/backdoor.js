import {hackServer, routeFinder} from '/utils/utils.js';

export async function main(ns) {
	let server = ns.args[0];
	let route = routeFinder(ns, server);
	if (route && hackServer(ns, server)) {
		for (let serv of route) {
			ns.connect(serv);
		}
		ns.tprint(`Installing backdoor on ${server}.`);
		await ns.installBackdoor();
		ns.tprint(`Backdoor successfully installed on ${server}.`);
		for (let serv of route.reverse()) {
			ns.connect(serv);
		}
	}
}

export function autocomplete(data) {
	return data.servers;
}