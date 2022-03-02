// noinspection JSUnresolvedVariable

export async function main(ns) {
	ns.disableLog('ALL');
	if (!ns.getPlayer().bitNodeN === 9 && !ns.getOwnedSourceFiles().some(s => s.n === 9)) throw new Error(`Script requires Hacknet servers to be unlocked`);
	const args = ns.flags([
		['l', false],
		['liquidate', false],
		['c', false],
		['continuous', false]
	]);
	const upgrade = args._[0] ?? 'Sell for Money';
	const target = args._[1] ?? undefined;
	const liquidate = args.l || args.liquidate;
	const continuous = args.c || args.continuous;
	while (true) {
		await spendHashes(ns, upgrade, target, liquidate);
		if (!continuous) break;
		await ns.sleep(1000);
	}
}

export async function spendHashes(ns, upgrade, target = undefined, liquidate = false) {
	const hn = ns.hacknet;
	const capacity = hn.hashCapacity();
	const globalProduction = Array.from({length: hn.numNodes()}, (_, i) => hn.getNodeStats(i)).reduce((total, node) => total + node.production, 0);
	while (hn.numHashes() > (liquidate ? hn.hashCost(upgrade) : capacity - 2 * globalProduction)) {
		target ? hn.spendHashes(upgrade, target) : hn.spendHashes(upgrade);
		await ns.sleep(1);
	}
}