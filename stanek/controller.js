import {getDefaultStanekData, getPatterns, setupPattern} from '/stanek/utils.js';
import {getDataFromPort, getDefaultReservedRamData, getManagerScripts, getPorts, getScripts} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const st = ns.stanek;
	const managerScripts = getManagerScripts();
	const ports = getPorts();
	const stanekPort = ns.getPortHandle(ports.stanek);
	const reservedRamPort = ns.getPortHandle(ports.reservedRam);
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		// Get Stanek data
		const stanekData = getDataFromPort(stanekPort, getDefaultStanekData());
		// Set up pattern
		setupPattern(ns, getPatterns(st.width(), st.height())[stanekData.pattern]);
		// Get chargeable fragment info
		const fragments = st.activeFragments().filter(f => f.numCharge < stanekData.maxCharges);
		if (fragments.length === 0) {
			ns.print(`INFO: All fragments are fully charged`);
			await ns.sleep(1000);
			continue;
		}
		// Get reserved RAM data
		const reservedRamData = getDataFromPort(reservedRamPort, getDefaultReservedRamData());
		// Reserve RAM on host for charging
		let managerScriptsRam = 0;
		managerScripts.filter(s => ns.scriptRunning(s, stanekData.host)).forEach(s => managerScriptsRam += ns.getScriptRam(s, stanekData.host));
		const reservedRam = ns.getServerMaxRam(stanekData.host) - managerScriptsRam;
		reservedRamData[stanekData.host] = (reservedRamData[stanekData.host] ?? 0) + reservedRam;
		reservedRamPort.tryWrite(reservedRamData);
		// Wait for RAM to free up
		while (ns.getServerMaxRam(stanekData.host) - ns.getServerUsedRam(stanekData.host) < reservedRam) {
			ns.clearLog();
			ns.print(`INFO: Waiting for RAM to free up`);
			await ns.sleep(1000);
		}
		// Charge Stanek
		await charger(ns);
		// Remove reserved RAM on host
		const updatedReservedRamData = getDataFromPort(reservedRamPort, getDefaultReservedRamData(), false);
		updatedReservedRamData[stanekData.host] = Math.max(0, (updatedReservedRamData[stanekData.host] ?? 0) - reservedRam);
		reservedRamPort.tryWrite(updatedReservedRamData);
		await ns.sleep(10000);
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
		ns.clearLog();
		// Get data
		const data = getDataFromPort(port, getDefaultStanekData());
		// Set up pattern
		setupPattern(ns, getPatterns(st.width(), st.height())[data.pattern]);
		// Get chargeable fragments
		const fragments = st.activeFragments().filter(f => f.numCharge < data.maxCharges);
		if (fragments.length === 0) return; // All fragments charged to full
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