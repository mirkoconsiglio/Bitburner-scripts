// Requires formulas
import {formatMoney, formatNumber, formatTime, printBoth} from '/utils.js';

const argsSchema = [
	['max-spend', Infinity],
	['max-payoff-time', Infinity]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, args) {
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
	let maxSpend = options['max-spend'];
	const maxPayoffTime = options['max-payoff-time'];
	while (true) {
		const spend = upgradeHacknet(ns, maxSpend, maxPayoffTime);
		if (typeof spend === 'string') {
			printBoth(ns, spend);
			break;
		}
		maxSpend -= spend;
		await ns.sleep(100);
	}
}

// Will buy the most effective hacknet upgrade, so long as it will pay for itself in maxPayoffTimeSeconds
/**
 *
 * @param {NS} ns
 * @param {number} maxSpend
 * @param {number} maxPayoffTimeSeconds
 * @returns {number|boolean}
 */
export function upgradeHacknet(ns, maxSpend = Infinity, maxPayoffTimeSeconds = 21600 /* 6 hours */) {
	const hn = ns.hacknet;
	const haveHacknetServers = ns.getPlayer().bitNodeN === 9 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 9);
	const form = haveHacknetServers ? ns.formulas.hacknetServers : ns.formulas.hacknetNodes;
	const currentHacknetMult = ns.getPlayer().hacknet_node_money_mult;
	// Find the best upgrade we can make to an existing node
	const upgrades = getUpgrades(ns);
	let bestUpgradePayoff = 0;
	let nodeToUpgrade;
	let bestUpgrade;
	let cost;
	let upgradedValue;
	let worstNodeProduction = Number.MAX_SAFE_INTEGER; // Used to hold how productive a newly purchased node might be
	for (let i = 0; i < hn.numNodes(); i++) {
		const nodeStats = hn.getNodeStats(i);
		// When a hacknet server runs scripts, nodeStats.production lags behind what it should be for current ram usage
		if (haveHacknetServers) nodeStats.production = form.hashGainRate(nodeStats.level, 0, nodeStats.ram, nodeStats.cores, currentHacknetMult);
		worstNodeProduction = Math.min(worstNodeProduction, nodeStats.production);
		// Get next best upgrade
		for (let upgrade of upgrades) {
			const currentUpgradeCost = upgrade.cost(i);
			const payoff = upgrade.addedProduction(nodeStats) / currentUpgradeCost; // Production per money
			if (payoff > bestUpgradePayoff) {
				bestUpgradePayoff = payoff;
				nodeToUpgrade = i;
				bestUpgrade = upgrade;
				cost = currentUpgradeCost;
				upgradedValue = upgrade.nextValue(nodeStats);
			}
		}
	}
	// Compare this to the cost of adding a new node
	let newNodeCost;
	let newNodePayoff;
	let shouldBuyNewNode;
	if (hn.numNodes() < hn.maxNumNodes()) {
		newNodeCost = hn.getPurchaseNodeCost();
		newNodePayoff = worstNodeProduction / newNodeCost;
		shouldBuyNewNode = newNodePayoff > bestUpgradePayoff;
	} else if (bestUpgradePayoff === 0) return false; // Cannot buy new node and payoff will be zero
	// If specified, only buy upgrades that will pay for themselves in payoffTimeSeconds
	const value = haveHacknetServers ? 0.25e6 : 1; // 1 hash = 0.25m
	let payoffTimeSeconds = 1 / (value * (shouldBuyNewNode ? newNodePayoff : bestUpgradePayoff));
	if (shouldBuyNewNode) cost = newNodeCost;
	// Prepare info about next purchase
	let strPurchase = (shouldBuyNewNode ? `a new node "hacknet-node-${hn.numNodes()}"` :
		`hacknet-node-${nodeToUpgrade} ${bestUpgrade.name} ${upgradedValue}`) + ` for ${formatMoney(ns, cost)}`;
	let strPayoff = `production ${formatNumber(ns, (shouldBuyNewNode ? newNodePayoff : bestUpgradePayoff) * cost)}, payoff time: ${formatTime(ns, 1000 * payoffTimeSeconds)}`;
	if (cost > maxSpend) {
		ns.print(`The next best purchase would be ${strPurchase} but the cost ${formatMoney(ns, cost)} exceeds the limit (${formatMoney(ns, maxSpend)})`);
		return 'Spending limit reached. Turning off Hacknet manager...'; // Overspending
	}
	if (payoffTimeSeconds > maxPayoffTimeSeconds) {
		ns.print(`The next best purchase would be ${strPurchase} but the ${strPayoff} is worse than the limit (${formatTime(ns, 1000 * maxPayoffTimeSeconds)})`);
		return 'Max payoff time reached. Turning off Hacknet manager...'; // Won't pay itself off
	}
	const success = shouldBuyNewNode ? hn.purchaseNode() !== -1 : bestUpgrade.upgrade(nodeToUpgrade, 1);
	ns.print(success ? `Purchased ${strPurchase} with ${strPayoff}` : `Insufficient funds to purchase the next best upgrade: ${strPurchase}`);
	return success ? cost : 0;
}

/**
 *
 * @param {NS} ns
 * @returns {Object<string, function, function, function, function>[]}
 */
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

/**
 *
 * @param {NS} ns
 * @param {string} type
 * @param {number} level
 * @returns {number}
 */
function productionMult(ns, type, level) {
	const hn = ns.hacknet;
	const haveHacknetServers = ns.getPlayer().bitNodeN === 9 || ns.singularity.getOwnedSourceFiles().some(s => s.n === 9);
	const form = haveHacknetServers ? ns.formulas.hacknetServers.hashGainRate : ns.formulas.hacknetNodes.moneyGainRate;
	let curLevel;
	let nextLevel;
	switch (type) {
		case 'level':
			curLevel = haveHacknetServers ? [level, 0, 1, 1] : [level, 1, 1];
			nextLevel = haveHacknetServers ? [level + 1, 0, 1, 1] : [level + 1, 1, 1];
			break;
		case 'ram':
			curLevel = haveHacknetServers ? [1, 0, level, 1] : [1, level, 1];
			nextLevel = haveHacknetServers ? [1, 0, level * 2, 1] : [1, level * 2, 1];
			break;
		case 'cores':
			curLevel = haveHacknetServers ? [1, 0, 1, level] : [1, 1, level];
			nextLevel = haveHacknetServers ? [1, 0, 1, level + 1] : [1, 1, level + 1];
			break;
		case 'cache': // Doesn't improve production, but we consider buying cache if hash is at percentageCutoff capacity
			const percentageCutoff = 0.95;
			const mult = 1 / (1 - percentageCutoff);
			return mult * (hn.numHashes() / hn.hashCapacity() - percentageCutoff);
		default:
			throw new Error(`Invalid type encountered in Hacknet production multiplier`);
	}
	return form(...nextLevel) / form(...curLevel) - 1;
}