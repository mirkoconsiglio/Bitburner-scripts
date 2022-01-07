export async function main(ns) {
	if (await ns.prompt(`Do you want to remove scripts not in scripts.txt?`)) {
		let scriptsToKeep = ns.read('scripts.txt').split('\n');
		let scriptsToRemove = ns.ls('home').filter(file =>
			(file.endsWith('.js') || file.endsWith('.txt')) &&
			!scriptsToKeep.includes(file)
		);
		for (let script of scriptsToRemove) {
			ns.tprint(`Removing ${script}`);
			ns.rm(script);
		}
	}
}