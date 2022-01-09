export function getFactions() {
	return [
		'CyberSec', 'Tian Di Hui', 'Netburners', 'Sector-12', 'Chongqing',
		'New Tokyo', 'Ishima', 'Aevum', 'Volhaven', 'NiteSec',
		'The Black Hand', 'BitRunners', 'ECorp', 'MegaCorp',
		'KuaiGong International', 'Four Sigma', 'NWO', 'Blade Industries',
		'OmniTek Incorporated', 'Bachman & Associates',
		'Clarke Incorporated', 'Fulcrum Secret Technologies',
		'Slum Snakes', 'Tetrads', 'Silhouette', 'Speakers for the Dead',
		'The Dark Army', 'The Syndicate', 'The Covenant', 'Daedalus',
		'Illuminati'
	];
}

export function isUsefulGeneral(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful general augmentations
			stats.faction_rep_mult ||
			name === 'CashRoot Starter Kit' ||
			name === 'Neurolink' ||
			name === 'PCMatrix' ||
			name === 'Neuroreceptor Management Implant'
		);
}

export function isUsefulHacking(ns, name) {
	let stats = ns.getAugmentationStats(name);
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

export function isUsefulCombat(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful combat augmentations
			stats.agility_exp_mult ||
			stats.agility_mult ||
			stats.defense_exp_mult ||
			stats.defense_mult ||
			stats.dexterity_exp_mult ||
			stats.dexterity_mult ||
			stats.strength_exp_mult ||
			stats.strength_mult ||
			stats.crime_money_mult ||
			stats.crime_success_mult
		);
}

export function isUsefulCompany(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful company augmentations
			stats.charisma_exp_mult ||
			stats.charisma_mult ||
			stats.company_rep_mult ||
			stats.work_money_mult
		);
}

export function isUsefulHacknet(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful hacknet augmentations
			stats.hacknet_node_core_cost_mult ||
			stats.hacknet_node_level_cost_mult ||
			stats.hacknet_node_money_mult ||
			stats.hacknet_node_purchase_cost_mult ||
			stats.hacknet_node_ram_cost_mult
		);
}

export function isUsefulBladeburner(ns, name) {
	let stats = ns.getAugmentationStats(name);
	return name !== 'NeuroFlux Governor' && // Ignore NFG
		( 	// Useful bladeburner augmentations
			stats.bladeburner_analysis_mult ||
			stats.bladeburner_max_stamina_mult ||
			stats.bladeburner_stamina_gain_mult ||
			stats.bladeburner_success_chance_mult
		);
}