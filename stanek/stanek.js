import {getFragmentType, getPatterns} from '/stanek/utils.js';
import {findPlaceToRun, getAccessibleServers, getFreeRam, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const args = ns.flags([
		['pattern', 'starter'],
		['threads-per-cycle', 10]
	]);
	const pattern = getPatterns()[args.pattern];
	const threadsPerCycle = args['threads-per-cycle'];
	const FragmentType = getFragmentType();
	const scripts = getScripts();
	const chargeable = pattern.filter(f => f.type !== FragmentType.None && f.type !== FragmentType.Delete && f.type !== FragmentType.Booster);
	const servers = getAccessibleServers(ns);
	for (let fragment of chargeable) {
		let current = Math.round((ns.stanek.activeFragments().find(f => f.id === fragment.fragmentID)?.avgCharge ?? 0) * 10) / 10;
		let last = 0;
		let i = 0;
		while (last === 0 || current > last || current < last) {
			const freeRams = getFreeRam(ns, servers);
			findPlaceToRun(ns, scripts.charge, threadsPerCycle, freeRams, fragment.rootX, fragment.rootY, i);
			last = current;
			ns.print(`${fragment.fragmentID} is at ${current}`);
			await ns.sleep(1000);
			current = Math.round((ns.stanek.activeFragments().find(f => f.id === fragment.fragmentID)?.avgCharge ?? 0) * 10) / 10;
		}
	}
}