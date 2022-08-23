// noinspection JSUnresolvedVariable

import {getCities, promptScriptRunning} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const bb = ns.bladeburner;
	if (ns.getPlayer().bitNodeN !== 7 && !ns.singularity.getOwnedSourceFiles().some(s => s.n === 7 && s.lvl >= 1)) throw new Error(`This script requires the Bladeburner API`);
	if (!bb.joinBladeburnerDivision()) throw new Error(`Must be able to join Bladeburner division`);
	// Minimum chance for switching actions
	const minChance = 1 / 3;
	// Sort black ops in ascending rank
	let maxRequiredRank = 0;
	const blackOps = bb.getBlackOpNames().map(blackOp => {
		const requiredRank = bb.getBlackOpRank(blackOp);
		if (maxRequiredRank < requiredRank) maxRequiredRank = requiredRank;
		return {name: blackOp, requiredRank};
	}).sort((a, b) => a.requiredRank - b.requiredRank);
	ns.print(`Max rank required: ${maxRequiredRank}`);
	let lastLookAround = 0;
	// Autopilot
	while (true) {
		const player = ns.getPlayer();
		const rank = bb.getRank();
		// Join Faction if we can
		if (rank > 25) bb.joinBladeburnerFaction();
		// Check if we can get skills
		let points = bb.getSkillPoints();
		while (points > 0) {
			const skills = getSkillsData().filter(s => bb.getSkillLevel(s.name) < s.max || s.max === -1).map(
				s => {
					const cost = bb.getSkillUpgradeCost(s.name);
					let value = s.bonus / cost;
					if (s.name === 'Overclock' &&
						bb.getActionEstimatedSuccessChance('Operation', 'Assassination')[0] === 1) value = 1000;
					else if (s.late &&
						bb.getSkillLevel('Overclock') < getSkillsData().find(s => s.name === 'Overclock').max) value = 0;
					return {
						...s,
						value: value,
						cost
					};
				}).sort((a, b) => b.value - a.value);
			// Get current best skill
			const skill = skills[0];
			if (skill.cost > points) break;
			// Purchase current best skill
			bb.upgradeSkill(skill.name);
			ns.print(`Purchasing ${skill.name} for ${skill.cost} skill points`);
			// Update skill points
			points = bb.getSkillPoints();
		}
		// Train combat to get 100 in all combat stats
		if (player.skills.strength < 100 || player.skills.defense < 100 ||
			player.skills.dexterity < 100 || player.skills.agility < 100) {
			await doAction(ns, 'General', 'Training');
			continue;
		}
		// Check if we can do black ops
		for (const blackOp of blackOps) {
			if (rank < blackOp.requiredRank) break; // Can't do this Black Op yet
			if (bb.getActionCountRemaining('BlackOps', blackOp.name) === 0) continue; // Already did the Black Op
			let [amin, amax] = bb.getActionEstimatedSuccessChance('BlackOps', blackOp.name);
			if (amax < 1) break; // Not yet at 100%
			while (amin !== amax) { // Needs field analysis
				await doAction(ns, 'General', 'Field Analysis');
				[amin, amax] = bb.getActionEstimatedSuccessChance('BlackOps', blackOp.name);
			}
			if (amax < 1) break; // Attempt only at 100%
			// Ask player to complete the Bitnode
			if (blackOp.name === 'Operation Daedalus') {
				while (promptScriptRunning(ns, 'home')) {
					await ns.sleep(1000);
				}
				if (!await ns.prompt(`Complete Operation Daedalus and finish Bitnode?`)) {
					ns.tprint(`Stopping Bladeburner manager`);
					return;
				}
			}
			await doAction(ns, 'BlackOps', blackOp.name);
		}
		// Get current city
		let city = bb.getCity();
		if (lastLookAround < Date.now() - 60 * 60 * 1000) {
			lastLookAround = Date.now();
			// Update best city
			ns.print(`Finding best city`);
			const raid = bb.getActionCountRemaining('Operation', 'Assassination') === 0;
			let bestPop = 0;
			let bestCity = '';
			for (const city of getCities()) {
				bb.switchCity(city);
				let [amin, amax] = bb.getActionEstimatedSuccessChance('Operation', 'Assassination');
				while (amin !== amax) {
					await improveAccuracy(ns);
					[amin, amax] = bb.getActionEstimatedSuccessChance('Operation', 'Assassination');
				}
				const pop = bb.getCityEstimatedPopulation(city);
				if (pop > bestPop && !(raid && bb.getCityCommunities(city) === 0)) {
					bestPop = pop;
					bestCity = city;
				}
			}
			// Switch to best city
			if (bestCity && city !== bestCity) {
				city = bestCity;
				ns.print(`Switched to ${city}`);
				bb.switchCity(city);
			}
		}
		// Check if chaos is over 50
		const chaos = bb.getCityChaos(city);
		if (chaos >= 50) {
			ns.print(`Chaos is high in ${city}`);
			if (bb.getActionEstimatedSuccessChance('Operation', 'Stealth Retirement Operation')[0] === 1 &&
				bb.getActionCountRemaining('Operation', 'Stealth Retirement Operation') > 0) {
				await doAction(ns, 'Operation', 'Stealth Retirement Operation');
			} else await doAction(ns, 'General', 'Diplomacy');
			continue;
		}
		// Get best action
		let needsImprovedAccuracy = false;
		const actions = getActionData().filter(a => {
			const [amin, amax] = bb.getActionEstimatedSuccessChance(a.type, a.name);
			const minMax = amin === amax;
			const include = a.late ? bb.getActionCountRemaining('Operation', 'Assassination') === 0 : true;
			if (!minMax) needsImprovedAccuracy = true;
			return bb.getActionCountRemaining(a.type, a.name) > 0 && minMax && amin >= minChance && include;
		}).map(a => {
			const level = bb.getActionCurrentLevel(a.type, a.name);
			const rewardMultiplier = Math.pow(a.rewardFac, level - 1);
			const gain = a.rankGain * rewardMultiplier * ns.getBitNodeMultipliers().BladeburnerRank;
			const time = bb.getActionTime(a.type, a.name);
			const [, amax] = bb.getActionEstimatedSuccessChance(a.type, a.name);
			return {
				...a,
				gain,
				level,
				rewardMultiplier,
				time,
				chance: amax
			};
		}).sort((a, b) => b.gain * b.chance / b.time - a.gain * a.chance / a.time);
		// Do field analysis if needed
		if (needsImprovedAccuracy) {
			await improveAccuracy(ns);
			continue;
		}
		// Check stamina
		const [stamina, maxStamina] = bb.getStamina();
		if (stamina < maxStamina / 2) {
			await doAction(ns, 'General', 'Hyperbolic Regeneration Chamber');
			continue;
		}
		// Do best action
		const action = actions[0];
		await doAction(ns, action.type, action.name);
	}
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
async function improveAccuracy(ns) {
	const [type, name] = bestOpForImprovingAccuracy(ns);
	await doAction(ns, type, name);
}

/**
 *
 * @param {NS} ns
 * @param {string} type
 * @param {string} name
 * @returns {Promise<void>}
 */
async function doAction(ns, type, name) {
	const bb = ns.bladeburner;
	// If already doing the action go back
	if (bb.getCurrentAction().name === name) {
		await ns.sleep(100);
		return;
	}
	// Take into account bonus time
	const actionTime = bb.getActionTime(type, name);
	const bonusTime = bb.getBonusTime();
	const time = bonusTime === 0
		? actionTime                            // If we don't have bonus time
		: bonusTime > actionTime
			? actionTime / 4                    // If we have more bonus time than action time
			: actionTime - 0.75 * bonusTime;    // If we have less bonus time than action time
	// Wait until the action finishes
	const started = bb.startAction(type, name);
	if (started) {
		ns.print(`Carrying out ${name}`);
		await ns.sleep(Math.ceil(time / 1e3) * 1e3 + 100);
	}
}

/**
 *
 * @returns {Object[]}
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
 * @returns {Object[]}
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
	return (0.04 * Math.pow(player.skills.hacking, 0.3) +
			0.04 * Math.pow(player.skills.intelligence, 0.9) +
			0.02 * Math.pow(player.skills.charisma, 0.3)) *
		player.mults.bladeburner_analysis;
}