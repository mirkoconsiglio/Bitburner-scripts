const url = 'https://raw.githubusercontent.com/mirkoconsiglio/Bitburner-scripts/master';
const listOfScripts = 'scripts.txt';

export async function main(ns) {
	ns.tprint('----- Downloading scripts -----');
	try {
		let download = await ns.wget(`${url}/scripts/${listOfScripts}`, listOfScripts);
		if (!download) throw listOfScripts;

		let scripts = ns.read(listOfScripts).split('\n');
		for (let script of scripts) {
			ns.tprint(`Downloading ${script}`);
			if (script.includes('/')) script = '/' + script;
			download = await ns.wget(`${url}/${script}`, script);
			if (!download) throw script;
		}
		ns.tprint('----- Download complete -----');
	} catch (script) {
		ns.tprint(`Could not download ${script}`);
	}
}