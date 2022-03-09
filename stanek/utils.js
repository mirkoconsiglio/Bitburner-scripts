/**
 *
 * @param width
 * @param height
 * @returns {Array}
 */
export function getPatterns(width, height) {
	const patterns = {};
	switch (true) { // Sorted in descending order of size
		case (width >= 6 && height >= 5) :
			patterns.starter = [
				{rootX: 0, rootY: 0, rotation: 0, fragmentID: 20, type: 12},
				{rootX: 4, rootY: 0, rotation: 0, fragmentID: 21, type: 13},
				{rootX: 3, rootY: 3, rotation: 0, fragmentID: 12, type: 8},
				{rootX: 0, rootY: 3, rotation: 0, fragmentID: 14, type: 9},
				{rootX: 3, rootY: 2, rotation: 0, fragmentID: 10, type: 7},
				{rootX: 0, rootY: 2, rotation: 0, fragmentID: 16, type: 10},
				{rootX: 0, rootY: 1, rotation: 0, fragmentID: 101, type: 18}
			];
			patterns.hack = [
				{rootX: 0, rootY: 0, rotation: 1, fragmentID: 6, type: 4},
				{rootX: 4, rootY: 0, rotation: 1, fragmentID: 5, type: 3},
				{rootX: 2, rootY: 0, rotation: 0, fragmentID: 0, type: 6},
				{rootX: 1, rootY: 2, rotation: 0, fragmentID: 102, type: 18},
				{rootX: 3, rootY: 3, rotation: 0, fragmentID: 1, type: 6},
				{rootX: 0, rootY: 4, rotation: 0, fragmentID: 20, type: 12},
				{rootX: 1, rootY: 0, rotation: 1, fragmentID: 7, type: 5}
			];
			patterns.bladeburner = [
				{rootX: 3, rootY: 0, rotation: 0, fragmentID: 30, type: 17},
				{rootX: 3, rootY: 3, rotation: 0, fragmentID: 12, type: 8},
				{rootX: 1, rootY: 0, rotation: 0, fragmentID: 10, type: 7},
				{rootX: 2, rootY: 1, rotation: 2, fragmentID: 101, type: 18},
				{rootX: 0, rootY: 0, rotation: 1, fragmentID: 16, type: 10},
				{rootX: 2, rootY: 3, rotation: 2, fragmentID: 14, type: 9},
				{rootX: 0, rootY: 2, rotation: 1, fragmentID: 18, type: 11}
			];
			break;
		default:
			throw new Error(`No patterns are defined for Stanek's gift of size ${width} by ${height}`);
	}
	return patterns;
}

/**
 *
 * @returns {{Delete: number, Charisma: number, Dexterity: number, HackingMoney: number, Booster: number, HackingChance: number, Hacking: number, HacknetCost: number, Defense: number, HackingSpeed: number, Agility: number, Crime: number, Rep: number, None: number, HacknetMoney: number, WorkMoney: number, Strength: number, HackingGrow: number, Bladeburner: number}}
 */
export function getFragmentType() {
	return {
		// Special fragments for the UI
		None: 0,
		Delete: 1,
		// Stats boosting fragments
		HackingChance: 2,
		HackingSpeed: 3,
		HackingMoney: 4,
		HackingGrow: 5,
		Hacking: 6,
		Strength: 7,
		Defense: 8,
		Dexterity: 9,
		Agility: 10,
		Charisma: 11,
		HacknetMoney: 12,
		HacknetCost: 13,
		Rep: 14,
		WorkMoney: 15,
		Crime: 16,
		Bladeburner: 17,
		// utility fragments.
		Booster: 18
	};
}

/**
 *
 * @param {NS} ns
 * @param {Number} fragmentID
 * @returns {Fragment}
 */
export function getFragment(ns, fragmentID) {
	return ns.stanek.fragmentDefinitions().find(f => f.id === fragmentID);
}

/**
 *
 * @param {NS} ns
 * @param {String} pattern
 */
export function setupPattern(ns, pattern) {
	const st = ns.stanek;
	for (let fragment of pattern) {
		const x = fragment.rootX;
		const y = fragment.rootY;
		const rot = fragment.rotation;
		const id = fragment.fragmentID;
		if (st.get(x, y)?.id === id) continue; // Fragment already placed there
		if (!st.canPlace(x, y, rot, id)) makeSpace(ns, x, y, rot, id); // Make space for fragment
		st.place(x, y, rot, id); // Place fragment
	}
}

function makeSpace(ns, rootX, rootY, rotation, fragmentID) {
	const st = ns.stanek;
	const fragment = getFragment(ns, fragmentID);
	const activeFragments = st.activeFragments();
	const sameActiveFragments = activeFragments.filter(f => f.id === fragmentID);
	// Check first if we are going over the limit
	if (sameActiveFragments.length + 1 > fragment.limit) {
		// Remove any fragments with the same ID
		for (let sameActiveFragment of sameActiveFragments) {
			st.remove(sameActiveFragment.x, sameActiveFragment.y);
		}
		// Check if we can place fragment now
		if (st.canPlace(rootX, rootY, rotation, fragmentID)) return true;
	}
	// Check if we are colliding with another fragment
	const currentFragmentCoordinates = getCoordinates(ns, rootX, rootY, fragment.shape, rotation);
	for (let other of getActiveFragmentsAndCoordinates(ns)) {
		// Check if there are colliding cells
		if (currentFragmentCoordinates.some(c => other.coordinates.some(e => e[0] === c[0] && e[1] === c[1]))) {
			st.remove(other.fragment.x, other.fragment.y);
		}
		// Check if we can place fragment now
		if (st.canPlace(rootX, rootY, rotation, fragmentID)) return true;
	}
	// Something is stopping us from making space
	throw new Error(`Could not make space for fragment`);
}

function getActiveFragmentsAndCoordinates(ns) {
	return Array.from(ns.stanek.activeFragments(), f => {
		return {
			fragment: f,
			coordinates: getCoordinates(ns, f.x, f.y, getFragment(ns, f.id).shape, f.rotation)
		};
	});
}

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
			if (x < 0 || y < 0 || x >= st.width() || y >= st.height()) throw new Error(`Invalid placement`);
			coordinates.push([x, y]);
		}
	}
	return coordinates;
}

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

function transpose(shape) {
	return Object.keys(shape[0]).map(c => shape.map(r => r[c]));
}

function reverse(shape) {
	return shape.map(r => r.reverse());
}