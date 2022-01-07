export async function main(ns) {
    let mults = ns.getBitNodeMultipliers()
    for (let [i, j] of Object.entries(mults)) {
        ns.tprint(`${i}: ${j}`);
    }
}