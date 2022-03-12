/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const url = 'https://raw.githubusercontent.com/mirkoconsiglio/Bitburner-scripts/master';
	const listOfScripts = 'build/scripts.txt';
	ns.tprint('----- Downloading scripts -----');
	ns.tprint(`Downloading ${listOfScripts}`);
	let download = await ns.wget(`${url}/${listOfScripts}`, '/' + listOfScripts);
	if (!download) throw new Error(`Could not download ${listOfScripts}`);
	let scripts = ns.read('/' + listOfScripts).split('\n');
	for (let script of scripts) {
		if (script === listOfScripts || (script.includes('/') ? '/' : '') + script === ns.getScriptName()) continue;
		ns.tprint(`Downloading ${script}`);
		download = await ns.wget(`${url}/${script}`, (script.includes('/') ? '/' : '') + script);
		if (!download) ns.alert(`Could not download ${script}`);
	}
	ns.tprint('----- Download complete -----');
}