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
	ns.travelToCity('Chongqing');
	ns.goToLocation('Church of the Machine God');
	[...eval('document').getElementsByTagName('*')].find(e => e.innerText === 'Accept Stanek\'s Gift').click();
}