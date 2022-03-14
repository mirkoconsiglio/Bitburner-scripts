import {getDefaultData, getPatterns, setupPattern} from 'stanek/utils.js';
import {getPorts, getScripts} from 'utils/utils.js';

// TODO: wait until RAM is mostly free
/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	// noinspection InfiniteLoopJS
	while (true) {
		await charger(ns);
		await ns.sleep(1000);
	}
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
async function charger(ns) {
	const st = ns.stanek;
	const scripts = getScripts();
	const port = ns.getPortHandle(getPorts().stanek);
	// Charge fragments
	while (true) {
		// Get data
		let data = port.read();
		if (data === 'NULL PORT DATA') data = getDefaultData();
		port.tryWrite(data);
		// Set up pattern
		if (data.pattern) setupPattern(ns, getPatterns(st.width(), st.height())[data.pattern]);
		// Get chargeable fragments
		const fragments = st.activeFragments().filter(f => f.numCharge < data.maxCharges);
		if (fragments.length === 0) {
			ns.alert(`There are no chargeable fragments on Stanek's gift`);
			return;
		}
		let statusUpdate = `Preparing to charge ${fragments.length} fragments to ${data.maxCharges}\n`;
		let minCharges = Number.MAX_SAFE_INTEGER;
		for (const fragment of fragments) {
			statusUpdate += `Fragment ${String(fragment.id).padStart(2)} at [${fragment.x}, ${fragment.y}], ` +
				`charge num: ${fragment.numCharge}, avg: ${ns.nFormat(fragment.avgCharge, '0.000a')}\n`;
			minCharges = Math.min(minCharges, fragment.numCharge);
		}
		ns.print(statusUpdate);
		if (minCharges >= data.maxCharges) break;
		// Charge each fragment one at a time
		for (const fragment of fragments) {
			let availableRam = ns.getServerMaxRam(data.host) - ns.getServerUsedRam(data.host);
			const threads = Math.floor((availableRam - data.reservedRam) / ns.getScriptRam(scripts.charge));
			// Only charge if we will not be bringing down the average
			if (threads < fragment.avgCharge * 0.99) {
				ns.print(`WARNING: The current average charge of fragment ${fragment.id} is ${ns.nFormat(fragment.avgCharge, '0.000a')}, ` +
					`indicating that it has been charged while there was ${ns.nFormat(2 * fragment.avgCharge * 1000 ** 3, '0.00b')} or more free RAM on home, ` +
					`but currently there is only ${ns.nFormat(availableRam * 1000 ** 3, '0.00b')} available, which would reduce the average charge and lower your stats. ` +
					`This update will be skipped, and you should free up RAM on home to resume charging.`);
				await ns.sleep(1000);
				continue;
			}
			const pid = ns.exec(scripts.charge, data.host, threads, fragment.x, fragment.y);
			while (ns.isRunning(pid, data.host)) await ns.sleep(100);
		}
		await ns.sleep(100);
	}
}