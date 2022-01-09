export async function main(ns) {
	let scriptsToKeep = [];
	ns.read('scripts.txt').split('\n').forEach((script) => {
		if (script.includes('/')) scriptsToKeep.push('/' + script);
		else scriptsToKeep.push(script);
	});
	let files = ns.ls('home').filter(file =>
		file.endsWith('.js') || file.endsWith('.txt'));
	for (let file of files) {
		if (!scriptsToKeep.includes(file)) {
			if (await ns.prompt(`Delete ${file}?`)) {
				ns.rm(file, 'home');
				ns.tprint(`Deleted ${file}`);
			}
		}
	}
}