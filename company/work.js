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
			ns.singularity.applyToCompany(company, position);
			if (!ns.singularity.workForCompany(company, ns.singularity.isFocused())) throw new Error(`Could not work for company (Not enough qualifications?)`);
			break;
		}
		while (ns.singularity.getCompanyRep(company) < rep) {
			ns.singularity.applyToCompany(company, position);
			if (!ns.singularity.workForCompany(company, ns.singularity.isFocused())) throw new Error(`Could not work for company (Not enough qualifications?)`);
			await ns.sleep(1000);
		}
	}
}