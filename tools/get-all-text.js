import {getServers} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const servers = getServers(ns);
	for (let server of servers) {
		let files = ns.ls(server);
		for (let file of files) {
			if (file.endsWith('.lit') || file.endsWith('.txt')) await ns.scp(file, server, 'home');
		}
	}
}