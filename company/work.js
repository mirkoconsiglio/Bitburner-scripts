// noinspection JSUnresolvedVariable

import {getCompanies, getCompanyPositions} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	while (true) {
		const companies = getCompanies();
		const company = await ns.prompt(`Work for company?`, {type: 'select', choices: ['None', ...companies]});
		if (company === 'None') break;
		const position = await ns.prompt(`Company position?`, {type: 'select', choices: getCompanyPositions(company)});
		const rep = Number(await ns.prompt(`Work until how much reputation? (Leave empty to work indefinitely)`, {type: 'text'}));
		if (!rep) {
			ns.applyToCompany(company, position);
			if (!ns.workForCompany(company, ns.isFocused())) throw new Error(`Could not work for company (Not enough qualifications?)`);
			break;
		}
		while (ns.getCompanyRep(company) < rep) {
			ns.applyToCompany(company, position);
			if (!ns.workForCompany(company, ns.isFocused())) throw new Error(`Could not work for company (Not enough qualifications?)`);
			await ns.sleep(1000);
		}
	}
}