import {bestOpForImprovingAccuracy, getActionData, getSkillsData} from '/bladeburner/utils.js';
import {getCities, promptScriptRunning} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const bb = ns.bladeburner;
	if (ns.getPlayer().bitNodeN !== 7 && !ns.getOwnedSourceFiles().some(s => s.n === 7 && s.lvl >= 1)) throw new Error(`This script requires the Bladeburner API`);
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
		if (player.strength < 100 || player.defense < 100 || player.dexterity < 100 || player.agility < 100) {
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
			if (city !== bestCity) {
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

// TODO: fix resetting action bug
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
	let time = bb.getActionTime(type, name);
	const bonusTime = bb.getBonusTime();
	if (bonusTime > 0) {
		if (bonusTime < time) {
			let diff = time - bonusTime;
			time = diff + bonusTime / 5;
		} else time /= 5;
	}
	// Wait until the action finishes
	const started = bb.startAction(type, name);
	if (started) {
		ns.print(`Carrying out ${name}`);
		await ns.sleep(time + 100);
	}
}