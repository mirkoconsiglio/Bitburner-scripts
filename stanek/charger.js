import {getFragmentType, getPatterns, setupPattern} from '/stanek/utils.js';
import {findPlaceToRun, getAccessibleServers, getFreeRam, getScripts} from '/utils/utils.js';

export async function main(ns) { // TODO: Optimize charger
	const pattern = getPatterns()[ns.args[0] ?? 'starter'];
	const threadsPerCycle = ns.args[1] ?? 1000;
	const scripts = getScripts();
	setupPattern(ns, pattern);
	const FragmentType = getFragmentType();
	const chargeable = pattern.filter(f => f.type !== FragmentType.None && f.type !== FragmentType.Delete && f.type !== FragmentType.Booster);
	for (let fragment of chargeable) {
		let current = Math.round((ns.stanek.activeFragments().find(f => f.id === fragment.fragmentID)?.avgCharge ?? 0) * 10) / 10;
		let last = 0;
		let i = 0;
		while (last === 0 || current > last || current < last) {
			const servers = getAccessibleServers(ns);
			const freeRams = getFreeRam(ns, servers);
			findPlaceToRun(ns, scripts.charge, threadsPerCycle, freeRams, fragment.rootX, fragment.rootY, i);
			ns.print(`${fragment.fragmentID} is at ${current}`);
			last = current;
			await ns.sleep(1000);
			current = Math.round((ns.stanek.activeFragments().find(f => f.id === fragment.fragmentID)?.avgCharge ?? 0) * 10) / 10;
		}
	}
}