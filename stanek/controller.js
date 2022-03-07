import {getFragmentType, setupPattern} from '/stanek/utils.js';
import {getScripts} from '/utils/utils.js';

export async function main(ns) {
	charger(ns, ...ns.args);
}

export async function charger(ns, pattern = 'starter', maxCharges = 100, host = 'home', reservedRam = 0) {
	ns.disableLog('ALL');
	const st = ns.stanek;
	const scripts = getScripts();
	setupPattern(ns, pattern);
	while (true) {
		const FragmentType = getFragmentType();
		const fragments = st.activeFragments().filter(f => f.type !== FragmentType.None && f.type !== FragmentType.Delete && f.type !== FragmentType.Booster);
		if (fragments.length === 0) {
			ns.alert(`There are no chargeable fragments on Stanek's gift`);
			return;
		}
		let statusUpdate = `Preparing to charge ${fragments.length} fragments to ${maxCharges}. Current charges:\n`;
		let minCharges = Number.MAX_SAFE_INTEGER;
		for (const fragment of fragments) {
			statusUpdate += `Fragment ${String(fragment.id).padStart(2)} at [${fragment.x}, ${fragment.y}] ` +
				`charge num: ${fragment.numCharge} avg: ${ns.nFormat(fragment.avgCharge, '0.000a')}\n`;
			minCharges = Math.min(minCharges, fragment.numCharge);
		}
		ns.print(statusUpdate);
		if (minCharges >= maxCharges) break;
		// Charge each fragment one at a time
		for (const fragment of fragments.filter(f => f.numCharge < maxCharges)) {
			let availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
			const threads = Math.floor((availableRam - reservedRam) / ns.getScriptRam(scripts.charge));
			// Only charge if we will not be bringing down the average
			if (threads < fragment.avgCharge * 0.99) {
				ns.print(`WARNING: The current average charge of fragment ${fragment.id} is ${ns.nFormat(fragment.avgCharge, '0.000a')}, ` +
					`indicating that it has been charged while there was ${ns.nFormat(2 * fragment.avgCharge * 1000 ** 3, '0.00b')} or more free RAM on home, ` +
					`but currently there is only ${ns.nFormat(availableRam * 1000 ** 3, '0.00b')} available, which would reduce the average charge and lower your stats. ` +
					`This update will be skipped, and you should free up RAM on home to resume charging.`);
				await ns.sleep(1000);
				continue;
			}
			const pid = ns.exec(scripts.charge, host, threads);
			while (ns.isRunning(pid, host)) await ns.sleep(1000);
		}
	}
}