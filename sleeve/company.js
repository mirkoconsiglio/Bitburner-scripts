import {getCompanies, getScripts} from '/utils/utils.js';

export async function main(ns) {
	const companies = getCompanies();
	const company = companies.find(company => company.toLowerCase() === ns.args[1].toLowerCase());
	if (!company) {
		ns.tprint(`Could not find ${ns.args[1]}`);
		ns.exit();
	}

	const scripts = getScripts();
	if (ns.isRunning(scripts.sleeve, 'home') &&
		await ns.prompt(`This requires that the sleeve manager is killed, continue?`)) {
		ns.kill(scripts.sleeve, 'home');
	} else ns.exit();

	ns.sleeve.setToCompanyWork(ns.args[0], company);
}