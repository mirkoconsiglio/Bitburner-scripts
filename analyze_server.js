export async function main(ns) {
    const server = ns.args[0];
    const usedRam = ns.getServerUsedRam(server);
    const maxRam = ns.getServerMaxRam(server);
    const money = ns.getServerMoneyAvailable(server);
    const maxMoney = ns.getServerMaxMoney(server);
    const minSec = ns.getServerMinSecurityLevel(server);
    const sec = ns.getServerSecurityLevel(server);

    ns.tprint(`
${server}:
    RAM        : ${ns.nFormat(usedRam * 1000 ** 3, "0.00b")} / ${ns.nFormat(maxRam * 1000 ** 3, "0.00b")} (${(usedRam / maxRam * 100).toFixed(2)}%)
    $          : ${ns.nFormat(money, "$0.000a")} / ${ns.nFormat(maxMoney, "$0.000a")} (${(money / maxMoney * 100).toFixed(2)}%)
    security   : ${minSec.toFixed(2)} / ${sec.toFixed(2)}
    growth     : ${ns.getServerGrowth(server)}
    hack time  : ${ns.tFormat(ns.getHackTime(server))}
    grow time  : ${ns.tFormat(ns.getGrowTime(server))}
    weaken time: ${ns.tFormat(ns.getWeakenTime(server))}
    grow x2    : ${Math.ceil(ns.growthAnalyze(server, 2))} threads
    grow x3    : ${Math.ceil(ns.growthAnalyze(server, 3))} threads
    grow x4    : ${Math.ceil(ns.growthAnalyze(server, 4))} threads
    hack 10%   : ${Math.floor(0.1 / ns.hackAnalyze(server))} threads
    hack 25%   : ${Math.floor(0.25 / ns.hackAnalyze(server))} threads
    hack 50%   : ${Math.floor(0.5 / ns.hackAnalyze(server))} threads
    hackChance : ${(ns.hackAnalyzeChance(server) * 100).toFixed(2)}%
`);
}

export function autocomplete(data) {
    return data.servers;
}