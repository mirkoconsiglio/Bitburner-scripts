import {getCompanies} from '/utils/utils.js';
import {disableSleeveAutopilot} from 'sleeve/utils.js';

export async function main(ns) {
	const sleeveNumber = ns.args[0] ?? throw new Error(`Need to specify sleeve number`);
	const company = ns.args[1] ?? throw new Error(`Need to specify company`);

	const foundCompany = getCompanies().find(c => c.toLowerCase() === company.toLowerCase());
	if (!foundCompany) {
		ns.tprint(`Could not find ${company}`);
		ns.exit();
	}

	disableSleeveAutopilot(ns, sleeveNumber);
	ns.sleeve.setToCompanyWork(sleeveNumber, foundCompany);
}