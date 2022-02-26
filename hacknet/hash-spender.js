// noinspection JSUnresolvedVariable

export async function main(ns) {
	ns.disableLog('ALL');
	if (!ns.getPlayer().bitNodeN === 9 && !ns.getOwnedSourceFiles().some(s => s.n === 9)) throw new Error(`Script requires Hacknet servers to be unlocked`);
	const args = ns.flags(
		['l', false],
		['liquidate', false],
		['c', false],
		['continuous', false]
	);
	const upgrade = args._[0];
	const target = args._[1] ?? undefined;
	const liquidate = args.l || args.liquidate;
	const continuous = args.c || args.continuous;
	while (true) {
		spendHashes(ns, upgrade, target, liquidate);
		if (!continuous) break;
		await ns.sleep(1000);
	}
}

export function spendHashes(ns, upgrade, target = undefined, liquidate = false) {
	const hn = ns.hacknet;
	const capacity = hn.hashCapacity();
	const startingHashes = hn.numHashes();
	const globalProduction = Array.from({length: hn.numNodes()}, (_, i) => hn.getNodeStats(i)).reduce((total, node) => total + node.production, 0);
	let success;
	while (hn.numHashes() > liquidate ? hn.hashCost(upgrade) : capacity - 2 * globalProduction) {
		success = hn.spendHashes(upgrade, target);
	}
	if (success) ns.print(`Spent ${startingHashes - hn.numHashes()} hashes at ${ns.nFormat(globalProduction, '$0.000a')} hashes per second`);
	else ns.print(`ERROR failed to spend hashes. (Have: ${hn.numHashes()} Capacity: ${hn.hashCapacity()}`);
}