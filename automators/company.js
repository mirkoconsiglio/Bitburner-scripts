// noinspection JSUnresolvedVariable

import {getCompanies, getJobs} from '/utils/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');

	const companies = getCompanies();
	const jobs = getJobs();
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
	if (args.agent) workType = jobs.agent.name;
	else if (args.business) workType = jobs.business.name;
	else if (args.it) workType = jobs.it.name;
	else if (args.security) workType = jobs.security.name;
	else if (args.software) workType = jobs.software.name;
	else if (args.software_consultant) workType = jobs.software_consultant.name;
	else if (args.employee) workType = jobs.employee.name;
	else if (args.part_time_employee) workType = jobs.part_time_employee.name;
	else if (args.waiter) workType = jobs.waiter.name;
	else if (args.part_time_waiter) workType = jobs.waiter.name;
	else throw new Error(`Invalid work type`);

	for (let i = 0; i < args._.length; i += 2) {
		let company = companies.find(company => company.toLowerCase() === args._[i].toLowerCase());
		if (company) {
			ns.tprint(`Working for ${company}`);
			while (ns.getCompanyRep(company) < args._[i + 1]) {
				ns.applyToCompany(company, workType);
				ns.workForCompany(company, ns.isFocused());
				await ns.sleep(1000);
			}
		} else ns.tprint(`Could not find ${args._[i]}`);
	}
}