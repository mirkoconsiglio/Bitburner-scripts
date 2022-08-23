/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	acceptStanek(ns);
}

/**
 *
 * @param {NS} ns
 */
export function acceptStanek(ns) {
	ns.singularity.travelToCity('Chongqing');
	ns.singularity.goToLocation('Church of the Machine God');
	[...eval('document').getElementsByTagName('*')].find(e => e.innerText === 'Accept Stanek\'s Gift').click();
}