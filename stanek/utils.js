/**
 *
 * @param {NS} ns
 * @param {number} fragmentID
 * @returns {Fragment}
 */
export function getFragment(ns, fragmentID) {
	return ns.stanek.fragmentDefinitions().find(f => f.id === fragmentID);
}