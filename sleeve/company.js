import {getCompanies} from '/utils/utils.js';
import {disableSleeveAutopilot} from 'sleeve/utils.js';

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
		ns.exit();
	}

	disableSleeveAutopilot(ns, args.sleeve);
	ns.sleeve.setToCompanyWork(args.sleeve, foundCompany);
}