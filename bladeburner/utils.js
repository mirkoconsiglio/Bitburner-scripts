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
			name: 'Short Circuit',
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
			max: -1
		},
		{
			name: 'Evasive System',
			bonus: 4,
			max: -1
		}
	];
}

export function getActionData() {
	return [
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
			rankGain: 2.2
		},
		{
			name: 'Undercover Operation',
			type: 'Operation',
			rewardFac: 1.09,
			rankGain: 4.4
		},
		// { // kills too much pop
		//     name: 'Sting Operation',
		//     type: 'Operation',
		//     rewardFac: 1.095,
		//     rankGain: 5.5,
		// },
		// { // Too much chaos
		//     name: 'Raid',
		//     type: 'Operation',
		//     rewardFac: 1.1,
		//     rankGain: 55,
		// },
		// { // kills too much pop
		//     name: 'Stealth Retirement Operation',
		//     type: 'Operation',
		//     rewardFac: 1.11,
		//     rankGain: 22,
		// },
		{
			name: 'Assassination',
			type: 'Operation',
			rewardFac: 1.14,
			rankGain: 44
		}
	];
}