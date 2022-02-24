export function getUpgrades(ns) {
	const hn = ns.hacknet;
	const haveHacknetServers = ns.getPlayer().bitNodeN === 9 || ns.getOwnedSourceFiles().some(s => s.n === 9);
	const form = haveHacknetServers ? ns.formulas.hacknetServers : ns.formulas.hacknetNodes;
	// Get the lowest cache level, we do not consider upgrading the cache level of servers above this until all have the same cache level
	const minCacheLevel = [...Array(hn.numNodes()).keys()].reduce((min, i) => Math.min(min, hn.getNodeStats(i).cache), Number.MAX_VALUE);
	return [
		{
			name: 'level',
			upgrade: hn.upgradeLevel,
			cost: i => hn.getLevelUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.level + 1,
			addedProduction: nodeStats => nodeStats.production * productionMult(form, 'level', nodeStats.level)
		},
		{
			name: 'ram',
			upgrade: hn.upgradeRam,
			cost: i => hn.getRamUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.ram * 2,
			addedProduction: nodeStats => nodeStats.production * productionMult(form, 'ram', nodeStats.ram)
		},
		{
			name: 'cores',
			upgrade: hn.upgradeCore,
			cost: i => hn.getCoreUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.cores + 1,
			addedProduction: nodeStats => nodeStats.production * productionMult(form, 'cores', nodeStats.cores)
		},
		{
			name: 'cache',
			upgrade: hn.upgradeCache,
			cost: i => hn.getCacheUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.cache + 1,
			addedProduction: nodeStats => nodeStats.cache > minCacheLevel || !haveHacknetServers ? 0 : nodeStats.production * productionMult(form, 'cache', nodeStats.cache)
		}
	];
}

function productionMult(form, type, level) {
	switch (type) {
		case 'level':
			return form.hashGainRate(level + 1, 0, 1, 1) / form.hashGainRate(level, 0, 1, 1) - 1;
		case 'ram':
			return form.hashGainRate(1, 0, level * 2, 1) / form.hashGainRate(1, 0, level, 1) - 1;
		case 'cores':
			return form.hashGainRate(1, 0, 1, level + 1) / form.hashGainRate(1, 0, 1, level) - 1;
		case 'cache':
			return 0.01 / level;
		default:
			throw new Error(`Invalid type encountered in Hacknet production multiplier`);
	}
}