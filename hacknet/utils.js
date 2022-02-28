export function getUpgrades(ns) {
	const hn = ns.hacknet;
	return [
		{
			name: 'level',
			upgrade: hn.upgradeLevel,
			cost: i => hn.getLevelUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.level + 1,
			addedProduction: nodeStats => nodeStats.production * productionMult(ns, 'level', nodeStats.level)
		},
		{
			name: 'ram',
			upgrade: hn.upgradeRam,
			cost: i => hn.getRamUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.ram * 2,
			addedProduction: nodeStats => nodeStats.production * productionMult(ns, 'ram', nodeStats.ram)
		},
		{
			name: 'cores',
			upgrade: hn.upgradeCore,
			cost: i => hn.getCoreUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.cores + 1,
			addedProduction: nodeStats => nodeStats.production * productionMult(ns, 'cores', nodeStats.cores)
		},
		{
			name: 'cache',
			upgrade: hn.upgradeCache,
			cost: i => hn.getCacheUpgradeCost(i, 1),
			nextValue: nodeStats => nodeStats.cache + 1,
			addedProduction: nodeStats => nodeStats.production * productionMult(ns, 'cache', nodeStats.cache)
		}
	];
}

function productionMult(ns, type, level) {
	const hn = ns.hacknet;
	const haveHacknetServers = ns.getPlayer().bitNodeN === 9 || ns.getOwnedSourceFiles().some(s => s.n === 9);
	const form = haveHacknetServers ? ns.formulas.hacknetServers.hashGainRate : ns.formulas.hacknetNodes.moneyGainRate;
	let curLevel;
	let nextLevel;
	switch (type) {
		case 'level':
			curLevel = haveHacknetServers ? [level, 0, 1, 1] : [level, 1, 1];
			nextLevel = haveHacknetServers ? [level + 1, 0, 1, 1] : [level + 1, 1, 1];
			break;
		case 'ram':
			curLevel = haveHacknetServers ? [1, level, 1, 1] : [1, level, 1];
			nextLevel = haveHacknetServers ? [1, level * 2, 1, 1] : [1, level * 2, 1];
			break;
		case 'cores':
			curLevel = haveHacknetServers ? [1, 0, 1, level] : [1, 1, level];
			nextLevel = haveHacknetServers ? [1, 0, 1, level + 1] : [1, 1, level + 1];
			break;
		case 'cache':
			return 0.1 * hn.numHashes() / hn.hashCapacity();
		default:
			throw new Error(`Invalid type encountered in Hacknet production multiplier`);
	}
	return form(...nextLevel) / form(...curLevel) - 1;
}