import {getCompanies} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');

	const companies = getCompanies();
	const args = ns.flags([
		['agent', false],
		['business', false],
		['it', false],
		['security', false],
		['software', false],
		['software_consultant', false],
		['employee', false],
		['part_time_employee', false],
		['waiter', false],
		['part_time_waiter', false]
	]);

	let workType;
	if (args.agent) workType = 'Agent';
	else if (args.business) workType = 'Business';
	else if (args.it) workType = 'IT';
	else if (args.security) workType = 'Security';
	else if (args.software) workType = 'software';
	else if (args.software_consultant) workType = 'Software Consultant';
	else if (args.employee) workType = 'Employee';
	else if (args.part_time_employee) workType = 'part-time Employee';
	else if (args.waiter) workType = 'Waiter';
	else if (args.part_time_waiter) workType = 'part-time Waiter';
	else {
		ns.tprint(`Invalid work type.`);
		ns.exit();
	}

	for (let i = 0; i < args._.length; i += 2) {
		let company = companies.find(company => company.toLowerCase() === args._[i]);
		if (company) {
			ns.tprint(`Working for ${company}.`);
			while (ns.getCompanyRep(company) < args._[i + 1]) {
				ns.applyToCompany(company, workType);
				ns.workForCompany(company, ns.isFocused());
				await ns.sleep(1000);
			}
		} else ns.tprint(`Could not find company.`);
	}
}