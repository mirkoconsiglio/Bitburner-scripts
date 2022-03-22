import {disableSleeveAutopilot} from '/sleeve/utils.js';
import {getCompanies} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const args = ns.flags([
		['sleeve', undefined],
		['company', undefined]
	]);
	if (!args.sleeve) throw new Error(`Need to specify --sleeve "number"`);
	if (!args.company) throw new Error(`Need to specify --company "name"`);

	const foundCompany = getCompanies().find(c => c.toLowerCase() === args.company.toLowerCase());
	if (!foundCompany) {
		ns.tprint(`Could not find ${args.company}`);
		return;
	}

	await disableSleeveAutopilot(ns, args.sleeve);
	ns.sleeve.setToCompanyWork(args.sleeve, foundCompany);
}