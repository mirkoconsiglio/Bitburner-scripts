export async function main(ns) {
	ns.tail();
	ns.disableLog('ALL');
	// noinspection InfiniteLoopJS
	while (true) {
		const server = ns.args[0];
		let money = ns.getServerMoneyAvailable(server);
		if (money === 0) money = 1;
		const maxMoney = ns.getServerMaxMoney(server);
		const minSec = ns.getServerMinSecurityLevel(server);
		const sec = ns.getServerSecurityLevel(server);
		ns.clearLog(server);
		ns.print(`${server}:`);
		ns.print(` $       : ${ns.nFormat(money, '$0.000a')} / ${ns.nFormat(maxMoney, '$0.000a')} (${(money / maxMoney * 100).toFixed(2)}%)`);
		ns.print(` security: +${sec - minSec}`);
		ns.print(` hack    : ${ns.getHackTime(server)} (t=${Math.ceil(ns.hackAnalyzeThreads(server, money))})`);
		ns.print(` grow    : ${ns.getGrowTime(server)} (t=${Math.ceil(ns.growthAnalyze(server, maxMoney / money))})`);
		ns.print(` weaken  : ${ns.getWeakenTime(server)} (t=${Math.ceil((sec - minSec) * 20)})`);
		await ns.sleep(100);
	}
}

// noinspection JSUnusedGlobalSymbols
export function autocomplete(data) {
	// noinspection JSUnresolvedVariable
	return data.servers;
}