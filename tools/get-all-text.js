import {getServers} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	for (const server of getServers(ns))
		for (const file of ns.ls(server))
			if (file.endsWith('.lit') || file.endsWith('.txt')) await ns.scp(file, 'home', server);
}