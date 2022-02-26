// Requires formulas
import {getUpgrades} from '/hacknet/utils.js';

export async function main(ns) {
	ns.disableLog('sleep');
	let maxSpend = Infinity;
	const maxPayoffTime = 18000; // 6 hours
	while (true) {
		const spend = upgradeHacknet(ns, maxSpend, maxPayoffTime);
		if (spend === false) {
			ns.print(`Spending limit reached. Stopping Hacknet manager...`);
			break;
		}
		maxSpend -= spend;
		await ns.sleep(100);
	}
}

// Will buy the most effective hacknet upgrade, so long as it will pay for itself in maxPayoffTimeSeconds
export function upgradeHacknet(ns, maxSpend = Infinity, maxPayoffTimeSeconds = 18000 /* 6 hours */) {
	const hn = ns.hacknet;
	const haveHacknetServers = ns.getPlayer().bitNodeN === 9 || ns.getOwnedSourceFiles().some(s => s.n === 9);
	const form = haveHacknetServers ? ns.formulas.hacknetServers : ns.formulas.hacknetNodes;
	const currentHacknetMult = ns.getPlayer().hacknet_node_money_mult;
	// Find the best upgrade we can make to an existing node
	const upgrades = getUpgrades(ns);
	let nodeToUpgrade;
	let bestUpgrade;
	let bestUpgradePayoff = 0;
	let cost = 0;
	let upgradedValue = 0;
	let worstNodeProduction = Number.MAX_VALUE; // Used to hold how productive a newly purchased node might be
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
				nodeToUpgrade = i;
				bestUpgrade = upgrade;
				bestUpgradePayoff = payoff;
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
		`hacknet-node-${nodeToUpgrade} ${bestUpgrade.name} ${upgradedValue}`) + ` for ${ns.nFormat(cost, '$0.000a')}`;
	let strPayoff = `production ${ns.nFormat((shouldBuyNewNode ? newNodePayoff : bestUpgradePayoff) * cost, '0.000a')}, payoff time: ${ns.tFormat(1000 * payoffTimeSeconds)}`;
	if (cost > maxSpend) {
		ns.print(`The next best purchase would be ${strPurchase} but the cost ${ns.nFormat(cost, '$0.000a')} exceeds the limit (${ns.nFormat(maxSpend, '$0.000a')})`);
		return false; // Overspending
	}
	if (payoffTimeSeconds > maxPayoffTimeSeconds) {
		ns.print(`The next best purchase would be ${strPurchase} but the ${strPayoff} is worse than the limit (${ns.tFormat(1000 * maxPayoffTimeSeconds)})`);
		return false; // Won't pay itself off
	}
	const success = shouldBuyNewNode ? hn.purchaseNode() !== -1 : bestUpgrade.upgrade(nodeToUpgrade, 1);
	ns.print(success ? `Purchased ${strPurchase} with ${strPayoff}` : `Insufficient funds to purchase the next best upgrade: ${strPurchase}`);
	return success ? cost : 0;
}