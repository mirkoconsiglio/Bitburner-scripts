export async function main(ns) {
	const url = 'https://raw.githubusercontent.com/mirkoconsiglio/Bitburner-scripts/master';
	const listOfScripts = `build/scripts.txt`;
	ns.tprint('----- Downloading scripts -----');
	try {
		ns.tprint(`Downloading ${listOfScripts}`);
		let download = await ns.wget(`${url}/${listOfScripts}`, '/' + listOfScripts);
		if (!download) throw listOfScripts;
		let scripts = ns.read(listOfScripts).split('\n');
		ns.tprint(scripts);
		ns.exit();
		for (let script of scripts) {
			ns.tprint(`Downloading ${script}`);
			if (script.includes('/')) script = '/' + script;
			download = await ns.wget(`${url}${script}`, script);
			if (!download) throw script;
		}
		ns.tprint('----- Download complete -----');
	} catch (script) {
		ns.tprint(`Could not download ${script}`);
	}
}