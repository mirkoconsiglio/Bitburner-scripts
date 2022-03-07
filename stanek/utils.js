export function getPatterns() {
	return {
		starter: [
			{rootX: 0, rootY: 0, rotation: 0, fragmentID: 20, type: 12},
			{rootX: 4, rootY: 0, rotation: 0, fragmentID: 21, type: 13},
			{rootX: 3, rootY: 3, rotation: 0, fragmentID: 12, type: 8},
			{rootX: 0, rootY: 3, rotation: 0, fragmentID: 14, type: 9},
			{rootX: 3, rootY: 2, rotation: 0, fragmentID: 10, type: 7},
			{rootX: 0, rootY: 2, rotation: 0, fragmentID: 16, type: 10},
			{rootX: 0, rootY: 1, rotation: 0, fragmentID: 101, type: 18}
		],
		hack: [
			{rootX: 0, rootY: 0, rotation: 1, fragmentID: 6, type: 4},
			{rootX: 4, rootY: 0, rotation: 1, fragmentID: 5, type: 3},
			{rootX: 2, rootY: 0, rotation: 0, fragmentID: 0, type: 6},
			{rootX: 1, rootY: 2, rotation: 0, fragmentID: 102, type: 18},
			{rootX: 3, rootY: 3, rotation: 0, fragmentID: 1, type: 6},
			{rootX: 0, rootY: 4, rotation: 0, fragmentID: 20, type: 12},
			{rootX: 1, rootY: 0, rotation: 1, fragmentID: 7, type: 5}
		],
		blade: [
			{rootX: 3, rootY: 0, rotation: 0, fragmentID: 30, type: 17},
			{rootX: 3, rootY: 3, rotation: 0, fragmentID: 12, type: 8},
			{rootX: 1, rootY: 0, rotation: 0, fragmentID: 10, type: 7},
			{rootX: 2, rootY: 1, rotation: 2, fragmentID: 101, type: 18},
			{rootX: 0, rootY: 0, rotation: 1, fragmentID: 16, type: 10},
			{rootX: 2, rootY: 3, rotation: 2, fragmentID: 14, type: 9},
			{rootX: 0, rootY: 2, rotation: 1, fragmentID: 18, type: 11}
		]
	};
}

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
	const coordinates = getCoordinates(ns, rootX, rootY, fragment.shape);
	for (let entry of getActiveFragmentsCoordinates(ns)) {
		if (coordinates.some(c => entry.coordinates.includes(c))) {
			st.remove(entry.fragment.x, entry.fragment.y);
		}
		// Check if we can place fragment now
		if (st.canPlace(rootX, rootY, rotation, fragmentID)) return true;
	}
	// Something is stopping us from making space
	return false;
}

// noinspection JSUnusedLocalSymbols
function fragmentHeight(ns, fragmentID, rotation) {
	const shape = getFragment(ns, fragmentID).shape;
	if (rotation % 2 === 0) return shape.length;
	return shape[0].length;
}

// noinspection JSUnusedLocalSymbols
function fragmentWidth(ns, fragmentID, rotation) {
	const shape = getFragment(ns, fragmentID).shape;
	if (rotation % 2 === 0) return shape[0].length;
	return shape.length;
}

export function getFragment(ns, fragmentID) {
	return ns.stanek.fragmentDefinitions().find(f => f.id === fragmentID);
}

function getCoordinates(ns, rootX, rootY, shape) {
	const st = ns.stanek;
	const coordinates = [];
	for (let [i, row] of shape.entries()) {
		for (let [j, cell] of row.entries()) {
			// Check if fragment occupies the cell
			if (cell === false) continue;
			const x = rootX + i;
			const y = rootY + j;
			// If we are going over the gift's edges continue
			if (x < 0 || y < 0 || x >= st.width() || y >= st.height()) continue;
			coordinates.push([x, y]);
		}
	}
	return coordinates;
}

function getActiveFragmentsCoordinates(ns) {
	const st = ns.stanek;
	const activeFragments = st.activeFragments();
	const data = [];
	for (let activeFragment of activeFragments) {
		data.push({
			fragment: activeFragment,
			coordinates: getCoordinates(ns, activeFragment.x, activeFragment.y, getFragment(ns, activeFragment.id).shape)
		});
	}
	return data;
}