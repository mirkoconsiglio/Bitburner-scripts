import {getCompanies} from '/utils.js';
import {disableSleeveAutopilot} from 'sleeve/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['sleeve', -1],
		['company', '']
	]);
	if (!args.sleeve) throw new Error(`Need to specify --sleeve number`);
	if (!args.company) throw new Error(`Need to specify --company`);

	const foundCompany = getCompanies().find(c => c.toLowerCase() === args.company.toLowerCase());
	if (!foundCompany) {
		ns.tprint(`Could not find ${args.company}`);
		return;
	}

	disableSleeveAutopilot(ns, args.sleeve);
	ns.sleeve.setToCompanyWork(args.sleeve, foundCompany);
}