import {disableSleeveAutopilot} from '/sleeve/utils.js';
import {getCompanies} from '/utils.js';

const argsSchema = [
	['sleeve', undefined],
	['company', undefined]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [...getCompanies()];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	// Get sleeve number
	if (!options.sleeve) throw new Error(`Need to specify --sleeve 'number'`);
	const sleeveNumber = options.sleeve;
	// Get company
	if (!options.faction) throw new Error(`Need to specify --company 'company'`);
	const company = options.company;
	const foundCompany = Object.keys(ns.getPlayer().jobs).find(c => c.toLowerCase() === company.toLowerCase());
	if (!foundCompany) throw new Error(`Invalid company or you haven't joined ${company} yet`);
	// Disable autopilot for this sleeve
	await disableSleeveAutopilot(ns, sleeveNumber);
	// Set sleeve to company work
	ns.sleeve.setToCompanyWork(sleeveNumber, foundCompany);
}