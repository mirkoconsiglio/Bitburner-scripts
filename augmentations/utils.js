/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulPrograms(ns, name) {
	return ignore(name) &&
		( 	// Useful programs augmentations
			name === 'CashRoot Starter Kit' || // Starting money and programs
			name === 'BitRunners Neurolink' || // Programs
			name === 'PCMatrix' // Programs
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulFaction(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) && stats.faction_rep; // Useful faction augmentations
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulFocus(ns, name) {
	return ignore(name) &&
		( 	// Useful focus augmentations
			name === 'Neuroreceptor Management Implant' || // No simultaneous penalty
			name === 'The Blade\'s Simulacrum' // Bladeburner and working
		);

}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulHacking(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) &&
		( 	// Useful hacking augmentations
			stats.hacking ||
			stats.hacking_exp ||
			stats.hacking_chance ||
			stats.hacking_speed ||
			stats.hacking_money ||
			stats.hacking_grow
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulHackingSkill(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) &&
		( 	// Useful hacking skill augmentations
			stats.hacking ||
			stats.hacking_exp
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulCombat(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) &&
		( 	// Useful combat augmentations
			stats.agility_exp ||
			stats.agility ||
			stats.defense_exp ||
			stats.defense ||
			stats.dexterity_exp ||
			stats.dexterity ||
			stats.strength_exp ||
			stats.strength
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulCrime(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) &&
		( 	// Useful crime augmentations
			stats.crime_money ||
			stats.crime_success
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulCompany(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) &&
		( 	// Useful company augmentations
			stats.charisma_exp ||
			stats.charisma ||
			stats.company_rep ||
			stats.work_money
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulHacknet(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) &&
		( 	// Useful hacknet augmentations
			stats.hacknet_node_core_cost ||
			stats.hacknet_node_level_cost ||
			stats.hacknet_node_money ||
			stats.hacknet_node_purchase_cost ||
			stats.hacknet_node_ram_cost
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulBladeburner(ns, name) {
	const stats = ns.singularity.getAugmentationStats(name);
	return ignore(name) &&
		( 	// Useful bladeburner augmentations
			stats.bladeburner_analysis ||
			stats.bladeburner_max_stamina ||
			stats.bladeburner_stamina_gain ||
			stats.bladeburner_success_chance
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulInfiltration(ns, name) {
	return ignore(name) && name.includes('SoA');
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isZeroCost(ns, name) {
	if (ns.singularity.getAugmentationPrice(name) === 0) return true;
}

/**
 *
 * @param {string} name
 * @return {boolean}
 */
function ignore(name) {
	return name !== 'NeuroFlux Governor' && !name.includes('Stanek\'s Gift');
}

/**
 *
 * @param {NS} ns
 * @param {function} criteria
 * @param {string} name
 * @returns {boolean}
 */
export function isUseful(ns, criteria, name) {
	for (const criterion of criteria) if (criterion(ns, name)) return true;
	return false;
}

