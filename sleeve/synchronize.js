import {getScripts} from '/utils/utils.js';

export async function main(ns) {
	const scripts = getScripts();
	if (ns.isRunning(scripts.sleeve, 'home') &&
		await ns.prompt(`This requires that the sleeve manager is killed, continue?`)) {
		ns.kill(scripts.sleeve, 'home');
	} else ns.exit();

	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
		ns.sleeve.setToSynchronize(i);
	}
}