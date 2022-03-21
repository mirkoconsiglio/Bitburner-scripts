/**
 *
 * @param {NS} ns
 * @param {number} fragmentID
 * @returns {Fragment}
 */
export function getFragment(ns, fragmentID) {
	return ns.stanek.fragmentDefinitions().find(f => f.id === fragmentID);
}

/**
 *
 * @returns {Object<string, number, string, number>}
 */
export function getDefaultStanekData() {
	return {
		pattern: 'starter',
		maxCharges: 100,
		host: 'home',
		reservedRam: 0
	};
}

