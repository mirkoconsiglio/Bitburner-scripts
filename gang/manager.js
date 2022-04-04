const argsSchema = [
	['disable-equipment-buying', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const options = ns.flags(argsSchema);
	const disableEquipmentBuying = options['disable-equipment-buying'];
	if (!ns.gang.inGang()) {
		ns.tprint(`You need to join a gang first`);
		return;
	}
	let counter = 0;
	// noinspection InfiniteLoopJS
	while (true) {
		// Check for recruits
		counter = recruitGangMembers(ns, counter);
		// Get gang info
		const gangRoster = Array.from(ns.gang.getMemberNames(), name => ns.gang.getMemberInformation(name));
		//Update Log
		ns.clearLog();
		ns.print(`Gang: ${getGangName(ns)}`);
		ns.print(`Gang Warfare: ${ns.gang.getGangInformation().territoryWarfareEngaged}`);
		for (const gangMember of gangRoster) ns.print(`${gangMember.name} - ${gangMember.task}`);
		// Check for ascensions
		ascendMembers(ns, gangRoster);
		// Check for equipment purchases
		if (!disableEquipmentBuying) purchaseEquipment(ns, gangRoster);
		// Assign tasks
		assignTasks(ns, gangRoster);
		// Check for territory warfare
		ns.gang.setTerritoryWarfare(territoryWarfare(ns));
		await ns.sleep(1000);
	}
}

/**
 *
 * @param {NS} ns
 * @returns {Object}
 */
function getData(ns) {
	if (ns.gang.getGangInformation().isHacking) return {
		gangName: getGangName(ns),
		isHacking: true,
		level: 500,
		name: 'hackerman-',
		training: 'Train Hacking',
		reduceWantedLevel: 'Ethical Hacking',
		terrorize: 'Cyberterrorism',
		money: 'Money Laundering',
		territoryWarfare: 'Territory Warfare',
		attribute: 'hack',
		asc_attribute: 'hack_asc_mult',
		clash: false
	};
	else return {
		gangName: getGangName(ns),
		isHacking: false,
		level: 500,
		name: 'gangsta-',
		training: 'Train Combat',
		reduceWantedLevel: 'Vigilante Justice',
		terrorize: 'Terrorism',
		money: 'Human Trafficking',
		territoryWarfare: 'Territory Warfare',
		attribute: 'str',
		asc_attribute: 'str_asc_mult',
		clash: true
	};
}

/**
 *
 * @param {NS} ns
 * @returns {string}
 */
export function getGangName(ns) {
	return ns.gang.getGangInformation().faction;
}

/**
 *
 * @param {NS} ns
 * @returns {string[]}
 */
function getOtherGangs(ns) {
	return Object.entries(ns.gang.getOtherGangInformation()).filter(([faction]) =>
		faction !== getGangName(ns));
}

/**
 *
 * @param {NS} ns
 * @param {number} counter
 */
export function recruitGangMembers(ns, counter) {
	const data = getData(ns);
	if (ns.gang.canRecruitMember()) {
		const name = data.name + counter;
		ns.gang.recruitMember(name);
		ns.gang.setMemberTask(name, data.training);
		counter++;
	}
	return counter;
}

/**
 *
 * @param {NS} ns
 * @param {GangMemberInfo[]} gangRoster
 */
export function ascendMembers(ns, gangRoster) {
	for (const gangMember of gangRoster) {
		if (!ns.gang.getAscensionResult(gangMember.name)) continue;
		const ascensionThreshold = calculateAscensionThreshold(gangMember[getData(ns).asc_attribute]);
		if (ns.gang.getAscensionResult(gangMember.name)[getData(ns).attribute] >= ascensionThreshold)
			ns.gang.ascendMember(gangMember.name);
	}
}

/**
 *
 * @param {number} asc_mult
 * @returns {number}
 */
function calculateAscensionThreshold(asc_mult) {
	return Math.max(1.6 + (1 - asc_mult) / 58, 1.1);
}

/**
 *
 * @param {NS} ns
 * @param {GangMemberInfo[]} gangRoster
 */
export function purchaseEquipment(ns, gangRoster) {
	const data = getData(ns);
	const orderedEquipment = data.isHacking ? getHackingEquipment(ns) : getCombatEquipment(ns);
	for (const gangMember of gangRoster) {
		if (gangMember[data.attribute] < data.level) continue;
		for (const equipment of orderedEquipment) {
			if (!gangMember.upgrades.includes(equipment) && !gangMember.augmentations.includes(equipment) &&
				!ns.gang.purchaseEquipment(gangMember.name, equipment)) break;
		}
	}
}

/**
 *
 * @param {NS} ns
 * @returns {string[]}
 */
function getHackingEquipment(ns) {
	const allEquipment = ns.gang.getEquipmentNames();
	const hackEquipment = allEquipment.filter(equipment => ns.gang.getEquipmentStats(equipment).hack).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	const chaEquipment = allEquipment.filter(equipment => ns.gang.getEquipmentStats(equipment).cha).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	return [...new Set([...hackEquipment, ...chaEquipment])];
}

/**
 *
 * @param {NS} ns
 * @returns {string[]}
 */
function getCombatEquipment(ns) {
	const allEquipment = ns.gang.getEquipmentNames();
	const strAndDefEquipment = allEquipment.filter(equipment => ns.gang.getEquipmentStats(equipment).str || ns.gang.getEquipmentStats(equipment).def).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	const dexAndAgiEquipment = allEquipment.filter(equipment => ns.gang.getEquipmentStats(equipment).dex || ns.gang.getEquipmentStats(equipment).agi).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	const chaAndHackEquipment = allEquipment.filter(equipment => ns.gang.getEquipmentStats(equipment).cha || ns.gang.getEquipmentStats(equipment).hack).sort((a, b) => ns.gang.getEquipmentCost(a) - ns.gang.getEquipmentCost(b));
	return [...new Set([...strAndDefEquipment, ...dexAndAgiEquipment, ...chaAndHackEquipment])];
}

/**
 *
 * @param {NS} ns
 * @param {GangMemberInfo[]} gangRoster
 */
export function assignTasks(ns, gangRoster) {
	const data = getData(ns);
	let warfareCounter = 0;
	for (const gangMember of gangRoster) {
		if (gangMember[data.attribute] < data.level) ns.gang.setMemberTask(gangMember.name, data.training);
		else if (ns.gang.getGangInformation().wantedPenalty < 0.5) ns.gang.setMemberTask(gangMember.name, data.reduceWantedLevel);
		else if (gangRoster.length < 12) ns.gang.setMemberTask(gangMember.name, data.terrorize);
		else if (data.clash && clashChance(ns).some(s => s < 0.8) &&
			ns.gang.getGangInformation().territory < 1 && warfareCounter < 6) {
			ns.gang.setMemberTask(gangMember.name, data.territoryWarfare);
			warfareCounter++;
		} else ns.gang.setMemberTask(gangMember.name, data.money);
	}
}

/**
 *
 * @param {NS} ns
 * @returns {number[]}
 */
function clashChance(ns) {
	return Array.from(getOtherGangs(ns), ([faction]) => ns.gang.getChanceToWinClash(faction));
}

/**
 *
 * @param {NS} ns
 * @returns {boolean}
 */
export function territoryWarfare(ns) {
	return (Number(Math.round(Number(ns.gang.getGangInformation().territory + 'e' + 10)) + 'e' + 10 * -1) < 1 &&
		fightForTerritory(ns, getOtherGangs(ns)));
}

/**
 *
 * @param {NS} ns
 * @returns {boolean}
 */
function fightForTerritory(ns) {
	let averageWinChance = 0;
	for (const [faction, info] of getOtherGangs(ns)) averageWinChance += info.territory * ns.gang.getChanceToWinClash(faction);
	return averageWinChance / (1 - ns.gang.getGangInformation().territory) >= 0.7;
}