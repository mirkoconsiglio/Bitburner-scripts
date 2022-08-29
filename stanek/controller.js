import {getFragment} from '/stanek/utils.js';
import {
	formatNumber,
	formatRam,
	getAccessibleServers,
	getFreeRam,
	getPortNumbers,
	getScripts,
	readFromFile,
	reserveRam,
	unreserveRam
} from '/utils.js';

// Constants
const portNumber = getPortNumbers().stanek;
const hostSearchDelay = 3600;

// Variables
let host;
let threads = 0;
let ram = 0;
let firstLoop = true;
let time = Date.now();
// TODO: Stanek is still crashing everything, not sure why but I need to find a fix
/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const st = ns.stanek;
	host = ns.getHostname();
	// noinspection InfiniteLoopJS
	while (true) {
		ns.clearLog();
		// Get Stanek data
		const data = readFromFile(ns, portNumber);
		// Get best host and the max RAM we can reserve for charging
		getBestHost(ns);
		// Set up pattern
		setupPattern(ns, getPatterns(st.giftWidth(), st.giftHeight())[data.pattern]);
		// Get chargeable fragment info
		const fragments = st.activeFragments().filter(f => f.numCharge < data.maxCharges && f.limit === 1);
		if (fragments.length === 0) {
			ns.print(`INFO: All fragments are fully charged`);
			await ns.sleep(1000);
			continue;
		}
		// Reserve RAM on host for charging
		await reserveRam(ns, host, ram);
		// Wait for RAM to free up
		while (ns.getServerMaxRam(host) - ns.getServerUsedRam(host) < ram) {
			ns.clearLog();
			ns.print(`INFO: Waiting for RAM to free up on ${host}: ` +
				`${formatRam(ns, ns.getServerMaxRam(host) - ns.getServerUsedRam(host))} ${formatRam(ns, ram)}`);
			await ns.sleep(1000);
		}
		// Charge Stanek
		await charger(ns);
		// Remove reserved RAM on host
		await unreserveRam(ns, host);
		// Update every second
		await ns.sleep(1000);
	}
}

/**
 *
 * @param {NS} ns
 */
function getBestHost(ns) {
	const scripts = getScripts();
	const chargeRam = ns.getScriptRam(scripts.charge);
	let bestHost, maxThreads = 0, maxRam = 0;
	for (const host of getAccessibleServers(ns)) {
		const maxRamAvailable = getFreeRam(ns, host, true);
		if (maxRamAvailable > maxRam) {
			bestHost = host;
			maxThreads = Math.floor(maxRamAvailable / chargeRam);
			maxRam = maxRamAvailable;
		}
	}
	if (firstLoop || (Date.now() >= time + hostSearchDelay && maxThreads > threads)) {
		ns.stanek.clearGift(); // Reset charges
		host = bestHost;
		threads = maxThreads;
		ram = maxRam;
		firstLoop = false;
		time = Date.now();
	}
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
async function charger(ns) {
	const st = ns.stanek;
	const script = getScripts().charge;
	const scriptRam = ns.getScriptRam(script);
	// Charge fragments
	while (true) {
		// Get data
		const data = readFromFile(ns, portNumber);
		// Set up pattern
		setupPattern(ns, getPatterns(st.giftWidth(), st.giftHeight())[data.pattern]);
		// Get chargeable fragments
		const fragments = st.activeFragments().filter(f => f.numCharge < data.maxCharges && f.limit === 1);
		if (fragments.length === 0) return; // All fragments charged to full
		// Charge each fragment one at a time
		for (const fragment of fragments) {
			statusUpdate(ns, data);
			const availableRam = ns.getServerMaxRam(host) - ns.getServerUsedRam(host);
			const availableThreads = Math.floor(availableRam / scriptRam);
			if (availableThreads <= 0) {
				ns.print(`INFO: Not enough RAM available on ${host} to charge Stanek. ` +
					`Waiting for RAM to free up.`);
				await ns.sleep(1000);
				continue;
			}
			// Only charge if we will not be bringing down the highest
			if (availableThreads < fragment.highestCharge * 0.99) {
				ns.print(`WARNING: The highest charge of fragment ${fragment.id} is ${formatNumber(ns, fragment.highestCharge)}, ` +
					`indicating that it has been charged while there was ${formatRam(ns, scriptRam * fragment.highestCharge)} or more free RAM on home, ` +
					`but currently there is only ${formatRam(ns, availableRam)} available, which would reduce the average charge and lower your stats. ` +
					`This update will be skipped, and you should free up RAM on home to resume charging.`);
				await ns.sleep(1000);
				continue;
			}
			const pid = ns.exec(script, host, threads, fragment.x, fragment.y);
			while (ns.isRunning(pid, host)) {
				await ns.sleep(100);
			}
		}
		await ns.sleep(100);
	}
}

/**
 *
 * @param {NS} ns
 * @param {Fragment[]} fragments
 * @param {Object} data
 */
function statusUpdate(ns, data) {
	ns.clearLog();
	const fragments = ns.stanek.activeFragments().filter(f => f.numCharge < data.maxCharges && f.limit === 1);
	let status = `Charging ${fragments.length} fragments to ${data.maxCharges}\n`;
	for (const fragment of fragments) {
		status += `Fragment ${String(fragment.id).padStart(2)} at [${fragment.x}, ${fragment.y}], ` +
			`charge num: ${fragment.numCharge}, highest: ${formatNumber(ns, fragment.highestCharge)}\n`;
	}
	ns.print(status);
}

/**
 *
 * @param {number} width
 * @param {number} height
 * @returns {Object<Object<number, number, number, number, number>[]>}
 */
function getPatterns(width, height) { // Can be filled in using stanek/save.js
	const patterns = {};
	switch (true) { // Sorted in descending order of size
		case width >= 8 && height >= 7:
			patterns.hacking = [
				{'rootX': 0, 'rootY': 0, 'rotation': 1, 'fragmentID': 6, 'type': 4},
				{'rootX': 4, 'rootY': 0, 'rotation': 1, 'fragmentID': 5, 'type': 3},
				{'rootX': 2, 'rootY': 0, 'rotation': 0, 'fragmentID': 0, 'type': 6},
				{'rootX': 1, 'rootY': 2, 'rotation': 0, 'fragmentID': 102, 'type': 18},
				{'rootX': 3, 'rootY': 3, 'rotation': 0, 'fragmentID': 1, 'type': 6},
				{'rootX': 0, 'rootY': 4, 'rotation': 0, 'fragmentID': 20, 'type': 12},
				{'rootX': 1, 'rootY': 0, 'rotation': 1, 'fragmentID': 7, 'type': 5},
				{'rootX': 3, 'rootY': 4, 'rotation': 2, 'fragmentID': 101, 'type': 18},
				{'rootX': 2, 'rootY': 5, 'rotation': 0, 'fragmentID': 25, 'type': 14},
				{'rootX': 5, 'rootY': 2, 'rotation': 1, 'fragmentID': 100, 'type': 18},
				{'rootX': 5, 'rootY': 5, 'rotation': 0, 'fragmentID': 28, 'type': 16},
				{'rootX': 0, 'rootY': 5, 'rotation': 0, 'fragmentID': 21, 'type': 13},
				{'rootX': 6, 'rootY': 0, 'rotation': 3, 'fragmentID': 18, 'type': 11}
			];
			break;
		case width >= 6 && height >= 5:
			patterns.starter = [
				{'rootX': 0, 'rootY': 0, 'rotation': 0, 'fragmentID': 20, 'type': 12},
				{'rootX': 4, 'rootY': 0, 'rotation': 0, 'fragmentID': 21, 'type': 13},
				{'rootX': 3, 'rootY': 3, 'rotation': 0, 'fragmentID': 12, 'type': 8},
				{'rootX': 0, 'rootY': 3, 'rotation': 0, 'fragmentID': 14, 'type': 9},
				{'rootX': 3, 'rootY': 2, 'rotation': 0, 'fragmentID': 10, 'type': 7},
				{'rootX': 0, 'rootY': 2, 'rotation': 0, 'fragmentID': 16, 'type': 10},
				{'rootX': 0, 'rootY': 1, 'rotation': 0, 'fragmentID': 101, 'type': 18}
			];
			patterns.hacking = [
				{'rootX': 0, 'rootY': 0, 'rotation': 1, 'fragmentID': 6, 'type': 4},
				{'rootX': 4, 'rootY': 0, 'rotation': 1, 'fragmentID': 5, 'type': 3},
				{'rootX': 2, 'rootY': 0, 'rotation': 0, 'fragmentID': 0, 'type': 6},
				{'rootX': 1, 'rootY': 2, 'rotation': 0, 'fragmentID': 102, 'type': 18},
				{'rootX': 3, 'rootY': 3, 'rotation': 0, 'fragmentID': 1, 'type': 6},
				{'rootX': 0, 'rootY': 4, 'rotation': 0, 'fragmentID': 20, 'type': 12},
				{'rootX': 1, 'rootY': 0, 'rotation': 1, 'fragmentID': 7, 'type': 5}
			];
			patterns.bladeburner = [
				{'rootX': 3, 'rootY': 0, 'rotation': 0, 'fragmentID': 30, 'type': 17},
				{'rootX': 3, 'rootY': 3, 'rotation': 0, 'fragmentID': 12, 'type': 8},
				{'rootX': 1, 'rootY': 0, 'rotation': 0, 'fragmentID': 10, 'type': 7},
				{'rootX': 2, 'rootY': 1, 'rotation': 2, 'fragmentID': 101, 'type': 18},
				{'rootX': 0, 'rootY': 0, 'rotation': 1, 'fragmentID': 16, 'type': 10},
				{'rootX': 2, 'rootY': 3, 'rotation': 2, 'fragmentID': 14, 'type': 9},
				{'rootX': 0, 'rootY': 2, 'rotation': 1, 'fragmentID': 18, 'type': 11}
			];
			break;
		case width >= 5 && height >= 5:
			patterns.starter = [
				{'rootX': 0, 'rootY': 0, 'rotation': 0, 'fragmentID': 1, 'type': 6},
				{'rootX': 2, 'rootY': 0, 'rotation': 3, 'fragmentID': 12, 'type': 8},
				{'rootX': 0, 'rootY': 3, 'rotation': 2, 'fragmentID': 16, 'type': 10},
				{'rootX': 2, 'rootY': 3, 'rotation': 2, 'fragmentID': 10, 'type': 7},
				{'rootX': 4, 'rootY': 0, 'rotation': 3, 'fragmentID': 6, 'type': 4},
				{'rootX': 0, 'rootY': 2, 'rotation': 2, 'fragmentID': 14, 'type': 9}
			];
			patterns.hacking = [
				{'rootX': 0, 'rootY': 2, 'rotation': 2, 'fragmentID': 1, 'type': 6},
				{'rootX': 0, 'rootY': 3, 'rotation': 0, 'fragmentID': 7, 'type': 5},
				{'rootX': 2, 'rootY': 1, 'rotation': 1, 'fragmentID': 102, 'type': 18},
				{'rootX': 0, 'rootY': 0, 'rotation': 1, 'fragmentID': 21, 'type': 13},
				{'rootX': 2, 'rootY': 0, 'rotation': 0, 'fragmentID': 5, 'type': 3},
				{'rootX': 4, 'rootY': 1, 'rotation': 1, 'fragmentID': 6, 'type': 4}
			];
			break;
		case width >= 3 && height >= 3:
			patterns.starter = [
				{'rootX': 0, 'rootY': 1, 'rotation': 0, 'fragmentID': 7, 'type': 5},
				{'rootX': 0, 'rootY': 0, 'rotation': 0, 'fragmentID': 1, 'type': 6}
			];
			patterns.hacking = [
				{'rootX': 0, 'rootY': 1, 'rotation': 0, 'fragmentID': 7, 'type': 5},
				{'rootX': 0, 'rootY': 0, 'rotation': 0, 'fragmentID': 1, 'type': 6}
			];
			break;
		default:
			throw new Error(`No patterns are defined for Stanek's gift of size ${width} by ${height}`);
	}
	return patterns;
}

/**
 *
 * @param {NS} ns
 * @param {string} pattern
 */
function setupPattern(ns, pattern) {
	const st = ns.stanek;
	for (const fragment of pattern) {
		const x = fragment.rootX;
		const y = fragment.rootY;
		const rot = fragment.rotation;
		const id = fragment.fragmentID;
		if (st.getFragment(x, y)?.id === id) continue; // Fragment already placed there
		if (!st.canPlaceFragment(x, y, rot, id)) makeSpace(ns, x, y, rot, id); // Make space for fragment
		st.placeFragment(x, y, rot, id); // Place fragment
	}
}

/**
 *
 * @param {NS} ns
 * @param {number} rootX
 * @param {number} rootY
 * @param {number} rotation
 * @param {number} fragmentID
 * @returns {boolean}
 */
function makeSpace(ns, rootX, rootY, rotation, fragmentID) {
	const st = ns.stanek;
	const fragment = getFragment(ns, fragmentID);
	const activeFragments = st.activeFragments();
	const sameActiveFragments = activeFragments.filter(f => f.id === fragmentID);
	// Check first if we are going over the limit
	if (sameActiveFragments.length + 1 > fragment.limit) {
		// Remove any fragments with the same ID
		for (let sameActiveFragment of sameActiveFragments) {
			st.removeFragment(sameActiveFragment.x, sameActiveFragment.y);
		}
		// Check if we can place fragment now
		if (st.canPlaceFragment(rootX, rootY, rotation, fragmentID)) return true;
	}
	// Check if we are colliding with another fragment
	const currentFragmentCoordinates = getCoordinates(ns, rootX, rootY, fragment.shape, rotation);
	for (let other of getActiveFragmentsAndCoordinates(ns)) {
		// Check if there are colliding cells
		if (currentFragmentCoordinates.some(c => other.coordinates.some(e => e[0] === c[0] && e[1] === c[1]))) {
			st.removeFragment(other.fragment.x, other.fragment.y);
		}
		// Check if we can place fragment now
		if (st.canPlaceFragment(rootX, rootY, rotation, fragmentID)) return true;
	}
	// Something is stopping us from making space
	throw new Error(`Could not make space for fragment`);
}

/**
 *
 * @param {NS} ns
 * @returns {Object<Fragment, [number, number][]>[]}
 */
function getActiveFragmentsAndCoordinates(ns) {
	return Array.from(ns.stanek.activeFragments(), f => {
		return {
			fragment: f,
			coordinates: getCoordinates(ns, f.x, f.y, getFragment(ns, f.id).shape, f.rotation)
		};
	});
}

/**
 *
 * @param {NS} ns
 * @param {number} rootX
 * @param {number} rootY
 * @param {boolean[][]} shape
 * @param {number} rotation
 * @returns {[number, number][]}
 */
function getCoordinates(ns, rootX, rootY, shape, rotation) {
	const st = ns.stanek;
	const coordinates = [];
	for (let [i, row] of getRotatedShape(shape, rotation).entries()) {
		for (let [j, cell] of row.entries()) {
			// Check if fragment occupies the cell
			if (cell === false) continue;
			const x = rootX + j;
			const y = rootY + i;
			// If we are going over the gift's edges throw an error
			if (x < 0 || y < 0 || x >= st.giftWidth() || y >= st.giftHeight()) throw new Error(`Invalid placement`);
			coordinates.push([x, y]);
		}
	}
	return coordinates;
}

/**
 *
 * @param {boolean[][]} shape
 * @param {number} rotation
 * @returns {boolean[][]}
 */
function getRotatedShape(shape, rotation) {
	switch (rotation) {
		case 0: // No rotation
			return shape;
		case 1: // Rotate by 90 degrees
			return reverse(transpose(shape));
		case 2: // Rotate by 180 degrees
			return reverse(transpose(reverse(transpose(shape))));
		case 3: // Rotate by 270 degrees
			return transpose(reverse(shape));
		default:
			throw new Error(`Invalid rotation`);
	}
}

/**
 *
 * @param {boolean[][]} shape
 * @returns {boolean[][]}
 */
function transpose(shape) {
	return Object.keys(shape[0]).map(c => shape.map(r => r[c]));
}

/**
 *
 * @param {boolean[][]} shape
 * @returns {boolean[][]}
 */
function reverse(shape) {
	return shape.map(r => r.reverse());
}