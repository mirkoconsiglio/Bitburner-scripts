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
			max: -1
		},
		{
			name: 'Evasive System',
			bonus: 4,
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
			rankGain: 0.1
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
			rankGain: 2.2
		},
		{
			name: 'Undercover Operation',
			type: 'Operation',
			rewardFac: 1.09,
			rankGain: 4.4
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