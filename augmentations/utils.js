/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulPrograms(ns, name) {
	return name !== 'NeuroFlux Governor' && // Ignore NFG
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
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		stats.faction_rep_mult; // Useful faction augmentations
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulFocus(ns, name) {
	return name !== 'NeuroFlux Governor' && // Ignore NFG
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
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful hacking augmentations
			stats.hacking_mult ||
			stats.hacking_exp_mult ||
			stats.hacking_chance_mult ||
			stats.hacking_speed_mult ||
			stats.hacking_money_mult ||
			stats.hacking_grow_mult
		)
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulHackingSkill(ns, name) {
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful hacking skill augmentations
			stats.hacking_mult ||
			stats.hacking_exp_mult
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulCombat(ns, name) {
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful combat augmentations
			stats.agility_exp_mult ||
			stats.agility_mult ||
			stats.defense_exp_mult ||
			stats.defense_mult ||
			stats.dexterity_exp_mult ||
			stats.dexterity_mult ||
			stats.strength_exp_mult ||
			stats.strength_mult
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulCrime(ns, name) {
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful crime augmentations
			stats.crime_money_mult ||
			stats.crime_success_mult
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulCompany(ns, name) {
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful company augmentations
			stats.charisma_exp_mult ||
			stats.charisma_mult ||
			stats.company_rep_mult ||
			stats.work_money_mult
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulHacknet(ns, name) {
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful hacknet augmentations
			stats.hacknet_node_core_cost_mult ||
			stats.hacknet_node_level_cost_mult ||
			stats.hacknet_node_money_mult ||
			stats.hacknet_node_purchase_cost_mult ||
			stats.hacknet_node_ram_cost_mult
		);
}

/**
 *
 * @param {NS} ns
 * @param {string} name
 * @returns {boolean}
 */
export function isUsefulBladeburner(ns, name) {
	const stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful bladeburner augmentations
			stats.bladeburner_analysis_mult ||
			stats.bladeburner_max_stamina_mult ||
			stats.bladeburner_stamina_gain_mult ||
			stats.bladeburner_success_chance_mult
		);
}

/**
 *
 * @param {NS} ns
 * @param {function} criteria
 * @param {string} name
 * @returns {boolean}
 */
export function isUseful(ns, criteria, name) {
	for (let criterion of criteria) if (criterion(ns, name)) return true;
	return false;
}

