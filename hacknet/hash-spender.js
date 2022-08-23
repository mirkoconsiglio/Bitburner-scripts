// noinspection JSUnresolvedVariable

const argsSchema = [
	['upgrade', 'Sell for Money'],
	['target', undefined],
	['liquidate', false],
	['continuous', false]
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
	if (!ns.getPlayer().bitNodeN === 9 && !ns.singularity.getOwnedSourceFiles().some(s => s.n === 9)) throw new Error(`Script requires Hacknet servers to be unlocked`);
	const options = ns.flags(argsSchema);
	const upgrade = options.upgrade;
	const target = options.target;
	const liquidate = options.liquidate;
	const continuous = options.continuous;
	while (true) {
		await spendHashes(ns, upgrade, target, liquidate);
		if (!continuous) break;
		await ns.sleep(1000);
	}
}

/**
 *
 * @param {NS} ns
 * @param {string} upgrade
 * @param {string} target
 * @param {boolean} liquidate
 * @returns {Promise<void>}
 */
export async function spendHashes(ns, upgrade, target = undefined, liquidate = false) {
	const hn = ns.hacknet;
	const capacity = hn.hashCapacity();
	const globalProduction = Array.from({length: hn.numNodes()}, (_, i) => hn.getNodeStats(i)).reduce((total, node) => total + node.production, 0);
	while (hn.numHashes() > (liquidate ? hn.hashCost(upgrade) : capacity - 2 * globalProduction)) {
		target ? hn.spendHashes(upgrade, target) : hn.spendHashes(upgrade);
		await ns.sleep(1);
	}
}