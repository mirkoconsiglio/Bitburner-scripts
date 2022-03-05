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