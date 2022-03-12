/**
 *
 * @returns {[{max: number, bonus: number, name: string},{max: number, bonus: number, name: string},{max: number, bonus: number, name: string},{max: number, bonus: number, name: string},{max: number, bonus: number, name: string},null,null,null,null,null,null,null,null,null,null,null]}
 */
export function getSkillsData() {
	return [
		{
			name: 'Blade\'s Intuition',
			bonus: 3,
			max: -1
		},
		{
			name: 'Cloak',
			bonus: 5.5,
			max: 25
		},
		{
			name: 'Short-Circuit',
			bonus: 5.5,
			max: 25
		},
		{
			name: 'Digital Observer',
			bonus: 4,
			max: -1
		},
		{
			name: 'Tracer',
			bonus: 4,
			max: 5
		},
		{
			name: 'Overclock',
			bonus: 0,
			max: 90
		},
		{
			name: 'Reaper',
			bonus: 4,
			max: 150
		},
		{
			name: 'Evasive System',
			bonus: 4,
			max: 150
		},
		{
			name: 'Datamancer',
			bonus: 1,
			max: -1,
			late: true
		},
		{
			name: 'Cyber\'s Edge',
			bonus: 0,
			max: -1
		},
		{
			name: 'Hands of Midas',
			bonus: 0,
			max: -1
		},
		{
			name: 'Hyperdrive',
			bonus: 0,
			max: -1
		},
		{
			name: 'Datamancer',
			bonus: 0,
			max: -1
		},
		{
			name: 'Cyber\'s Edge',
			bonus: 0,
			max: -1
		},
		{
			name: 'Hands of Midas',
			bonus: 0,
			max: -1
		},
		{
			name: 'Hyperdrive',
			bonus: 0,
			max: -1
		}
	];
}

/**
 *
 * @returns {[{rankGain: number, name: string, rewardFac: number, type: string},{rankGain: number, name: string, rewardFac: number, accuracy: string, type: string},{rankGain: number, name: string, rewardFac: number, type: string},{rankGain: number, name: string, rewardFac: number, type: string},{rankGain: number, name: string, rewardFac: number, type: string},null,null,null,null,null,null,null,null,null,null]}
 */
export function getActionData() {
	return [
		// General
		{
			name: 'Training',
			type: 'General',
			rewardFac: 0,
			rankGain: 0
		},
		{
			name: 'Field Analysis',
			type: 'General',
			rewardFac: 1,
			rankGain: 0.1,
			accuracy: 'eff'
		},
		{
			name: 'Recruitment',
			type: 'General',
			rewardFac: 0,
			rankGain: 0
		},
		{
			name: 'Diplomacy',
			type: 'General',
			rewardFac: 0,
			rankGain: 0
		},
		{
			name: 'Hyperbolic Regeneration Chamber',
			type: 'General',
			rewardFac: 0,
			rankGain: 0
		},
		{
			name: 'Incite Violence',
			type: 'General',
			rewardFac: 0,
			rankGain: 0
		},
		// Contracts
		{
			name: 'Tracking',
			type: 'Contract',
			rewardFac: 1.041,
			rankGain: 0.3
		},
		{
			name: 'Bounty Hunter',
			type: 'Contract',
			rewardFac: 1.085,
			rankGain: 0.9
		},
		{
			name: 'Retirement',
			type: 'Contract',
			rewardFac: 1.065,
			rankGain: 0.6
		},
		// Operations
		{
			name: 'Investigation',
			type: 'Operation',
			rewardFac: 1.07,
			rankGain: 2.2,
			accuracy: 0.4
		},
		{
			name: 'Undercover Operation',
			type: 'Operation',
			rewardFac: 1.09,
			rankGain: 4.4,
			accuracy: 0.8
		},
		{
			name: 'Sting Operation',
			type: 'Operation',
			rewardFac: 1.095,
			rankGain: 5.5,
			late: true
		},
		{
			name: 'Raid',
			type: 'Operation',
			rewardFac: 1.1,
			rankGain: 55,
			late: true
		},
		{
			name: 'Stealth Retirement Operation',
			type: 'Operation',
			rewardFac: 1.11,
			rankGain: 22,
			late: true
		},
		{
			name: 'Assassination',
			type: 'Operation',
			rewardFac: 1.14,
			rankGain: 44
		}
	];
}

/**
 *
 * @param {NS} ns
 * @returns {[string, string]}
 */
export function bestOpForImprovingAccuracy(ns) {
	const bb = ns.bladeburner;
	const improvingAccuracyActions = getActionData().filter(a => a.accuracy);
	let bestCost = 0;
	let type;
	let op;
	for (let action of improvingAccuracyActions) {
		if (bb.getActionCountRemaining(action.type, action.name) === 0) continue;
		let cost = action.accuracy;
		if (cost === 'eff') cost = calculateEff(ns); // Used for general field analysis
		cost *= bb.getActionEstimatedSuccessChance(action.type, action.name)[1]; // Multiply by current supposed best chance
		cost /= bb.getActionTime(action.type, action.name); // Divide by time taken for the action to complete
		if (cost > bestCost) {
			bestCost = cost;
			type = action.type;
			op = action.name;
		}
	}
	return [type, op];
}

/**
 *
 * @param {NS} ns
 * @returns {number}
 */
function calculateEff(ns) {
	const player = ns.getPlayer();
	return (0.04 * Math.pow(player.hacking, 0.3) +
			0.04 * Math.pow(player.intelligence, 0.9) +
			0.02 * Math.pow(player.charisma, 0.3)) *
		player.bladeburner_analysis_mult;
}