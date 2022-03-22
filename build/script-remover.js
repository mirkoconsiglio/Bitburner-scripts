import {getFileHandle} from 'utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const scriptsToKeep = ['/build/scripts.txt', '/build/download-bitburner-scripts.js'];
	ns.read('/build/scripts.txt').split('\n').forEach(script =>
		script.includes('/') ? scriptsToKeep.push('/' + script) : scriptsToKeep.push(script));
	for (let i = 1; i <= 20; i++) scriptsToKeep.push(getFileHandle(i));
	let files = ns.ls('home').filter(file => file.endsWith('.js') || file.endsWith('.txt'));
	if (files.length === 0) {
		ns.tprint(`There are no files to delete`);
		return;
	}
	for (let file of files) {
		if (!scriptsToKeep.includes(file)) {
			if (await ns.prompt(`Delete ${file}?`)) {
				ns.rm(file, 'home');
				ns.tprint(`Deleted ${file}`);
			}
		}
	}
}