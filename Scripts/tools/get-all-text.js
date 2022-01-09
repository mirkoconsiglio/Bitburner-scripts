import {getServers} from "../utils/utils";

export async function main(ns) {
	let servers = getServers(ns);
	for (let server of servers) {
		let files = ns.ls(server);
		for (let file of files) {
			if (file.endsWith('.lit') || file.endsWith('.txt')) {
				await ns.scp(file, server, 'home');
			}
		}
	}
}