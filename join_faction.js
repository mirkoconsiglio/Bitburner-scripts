/** @param {NS} ns **/
export async function main(ns) {
	if(ns.joinFaction(ns.args[0])) {
		ns.tprint(`Joined ${ns.args[0]}.`);
	}
	else ns.tprint(`Could not join ${ns.args[0]}.`);
}