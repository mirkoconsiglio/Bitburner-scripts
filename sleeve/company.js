import {getCompanies, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const companies = getCompanies();
	const company = companies.find(company => company.toLowerCase() === ns.args[0]);
	if (!company) {
		ns.tprint(`Could not find ${ns.args[0]}`);
		ns.exit();
	}

	const scripts = getScripts();
	if (ns.isRunning(scripts.sleeve, 'home') &&
		await ns.prompt(`This requires that the sleeve manager is killed, continue?`)) {
		ns.kill(scripts.sleeve, 'home');
	} else ns.exit();

	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
		ns.sleeve.setToCompanyWork(i, company);
	}
}