// Requires WarehouseAPI and OfficeAPI
import {
	buyMaterialsUpto,
	expandCity,
	expandIndustry,
	finishProduct,
	getJobs,
	hireAdVertUpto,
	hireMaxEmployees,
	investmentOffer,
	makeProduct,
	purchaseWarehouse,
	unlockUpgrade,
	upgradeOffice,
	upgradeUpto,
	upgradeWarehouseUpto
} from '/corporation/utils.js';
import {getCities} from '/utils/utils.js';

export async function main(ns) {
	ns.disableLog('ALL');
	if (!ns.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3) && !ns.corporation.hasUnlockUpgrade('Warehouse API')) throw new Error(`This script requires the Warehouse API`);
	if (!ns.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3) && !ns.corporation.hasUnlockUpgrade('Office API')) throw new Error(`This script requires the Office API`);
	// Set up
	const cities = getCities();
	const jobs = getJobs();
	const division1 = 'Agriculture';
	const division2 = 'Tobacco';
	// Part 1
	await part1(ns, cities, jobs, division1);
	// Part 2
	await part2(ns, cities, jobs, division1);
	// Part 3
	await part3(ns, cities, jobs, division2);
	// Autopilot
	await autopilot(ns, cities, jobs, division2);
}

export async function part1(ns, cities, jobs, division) {
	const corp = ns.corporation;
	// Expand to Agriculture division
	await expandIndustry(ns, 'Agriculture', division);
	// Unlock Smart Supply
	await unlockUpgrade(ns, 'Smart Supply');
	// Turn on Smart Supply
	corp.setSmartSupply(division, 'Sector-12', true);
	// Expand
	for (let city of cities) {
		// Expand to city
		await expandCity(ns, division, city);
		// Purchase warehouse
		await purchaseWarehouse(ns, division, city);
		// upgrade office to 3 and assign jobs
		const settings = [
			{job: 'Operations', num: 1},
			{job: 'Engineer', num: 1},
			{job: 'Business', num: 1}
		];
		await upgradeOffice(ns, division, city, 3, settings);
		// Start selling material
		corp.sellMaterial(division, city, 'Food', 'MAX', 'MP');
		corp.sellMaterial(division, city, 'Plants', 'MAX', 'MP');
	}
	// Upgrade warehouse upto level 2
	for (let city of cities) {
		await upgradeWarehouseUpto(ns, division, city, 2);
	}
	// Hire advert
	await hireAdVertUpto(ns, division, 1);
}

export async function part2(ns, cities, jobs, division) {
	// Get upgrades
	let upgrades = [
		{name: 'FocusWires', level: 2},
		{name: 'Neural Accelerators', level: 2},
		{name: 'Speech Processor Implants', level: 2},
		{name: 'Nuoptimal Nootropic Injector Implants', level: 2},
		{name: 'Smart Factories', level: 2}
	];
	await upgradeUpto(ns, upgrades);
	// Boost production
	for (let city of cities) {
		const materials = [
			{name: 'Hardware', qty: 125},
			{name: 'AI Cores', qty: 75},
			{name: 'Real Estate', qty: 27e3}
		];
		await buyMaterialsUpto(ns, division, city, materials);
	}
	// Wait for investment offer of $210b for the first round
	await investmentOffer(ns, 210e9, 1);
	// Upgrade office size to nine
	for (let city of cities) {
		const settings = [
			{job: 'Operations', num: 2},
			{job: 'Engineer', num: 2},
			{job: 'Business', num: 1},
			{job: 'Management', num: 2},
			{job: 'Research & Development', num: 2}
		];
		await upgradeOffice(ns, division, city, 9, settings);
	}
	// Upgrade factories and storage
	upgrades = [
		{name: 'Smart Factories', level: 10},
		{name: 'Smart Storage', level: 10}
	];
	await upgradeUpto(ns, upgrades);
	// Upgrade warehouses
	for (let city of cities) {
		await upgradeWarehouseUpto(ns, division, city, 9);
	}
	// Boost production
	for (let city of cities) {
		const materials = [
			{name: 'Hardware', qty: 2800},
			{name: 'Robots', qty: 96},
			{name: 'AI Cores', qty: 2520},
			{name: 'Real Estate', qty: 146400}
		];
		await buyMaterialsUpto(ns, division, city, materials);
	}
	// Wait for investment offer of $5t for the second round
	await investmentOffer(ns, 5e12, 2);
	// Upgrade warehouses
	for (let city of cities) {
		await upgradeWarehouseUpto(ns, division, city, 19);
	}
	// Boost production
	for (let city of cities) {
		const materials = [
			{name: 'Hardware', qty: 9300},
			{name: 'Robots', qty: 726},
			{name: 'AI Cores', qty: 6270},
			{name: 'Real Estate', qty: 230400}
		];
		await buyMaterialsUpto(ns, division, city, materials);
	}
}

export async function part3(ns, cities, jobs, division, mainCity = 'Aevum') {
	const corp = ns.corporation;
	// Expand into Tobacco industry
	await expandIndustry(ns, 'Tobacco', division);
	for (let city of cities) {
		// Expand to city
		await expandCity(ns, division, city);
		// Purchase warehouse
		await purchaseWarehouse(ns, division, city);
		if (city === mainCity) {
			// Upgrade Office size to 60
			const settings = [
				{job: 'Operations', num: 6},
				{job: 'Engineer', num: 6},
				{job: 'Business', num: 6},
				{job: 'Management', num: 6},
				{job: 'Research & Development', num: 6}
			];
			await upgradeOffice(ns, division, city, 30, settings);
		} else {
			// Upgrade Office size to nine
			const settings = [
				{job: 'Operations', num: 2},
				{job: 'Engineer', num: 2},
				{job: 'Business', num: 1},
				{job: 'Management', num: 2},
				{job: 'Research & Development', num: 2}
			];
			await upgradeOffice(ns, division, city, 9, settings);
		}
	}
	// Start making Tobacco v1
	await makeProduct(ns, division, mainCity, 'Tobacco v1', 1e9, 1e9);
	// Get upgrades
	let upgrades = [
		{name: 'FocusWires', level: 20},
		{name: 'Neural Accelerators', level: 20},
		{name: 'Speech Processor Implants', level: 20},
		{name: 'Nuoptimal Nootropic Injector Implants', level: 20},
		{name: 'Wilson Analytics', level: 14}
	];
	await upgradeUpto(ns, upgrades);
	// Wait for Tobacco v1 to finish
	await finishProduct(ns, division, 'Tobacco v1');
	// Start selling Tobacco v1 in all cities
	corp.sellProduct(division, mainCity, 'Tobacco v1', 'MAX', 'MP*2', true);
	// Start making Tobacco v2
	await makeProduct(ns, division, mainCity, 'Tobacco v2', 2e9, 2e9);
	// Wait for Tobacco v2 to finish
	await finishProduct(ns, division, 'Tobacco v2');
	// Start selling Tobacco v2 in all cities
	corp.sellProduct(division, mainCity, 'Tobacco v2', 'MAX', 'MP*4', true);
	// Start making Tobacco v3
	await makeProduct(ns, division, mainCity, 'Tobacco v3', 4e9, 4e9);
}
export async function autopilot(ns, cities, jobs, division, mainCity = 'Aevum') {
	const corp = ns.corporation;
	const market1 = 'Market-TA.I';
	const market2 = 'Market-TA.II';
	// Start making Tobacco v3 if it has not already started
	let version = 3;
	await makeProduct(ns, division, mainCity, 'Tobacco v3', 4e9, 4e9);
	// Check tobacco progress
	while (true) {
		if (corp.getProduct(division, 'Tobacco v' + version).developmentProgress >= 100) {
			// Start selling the developed version
			corp.sellProduct(division, mainCity, 'Tobacco v' + version, 'MAX', 'MP*' + (2 ** version), true);
			if (corp.hasResearched(division, market2)) corp.setProductMarketTA2(division, 'Tobacco v' + version, true);
			// Discontinue previous version
			corp.discontinueProduct(division, 'Tobacco v' + (version - 1));
			// Start making new version
			await makeProduct(ns, division, mainCity, 'Tobacco v' + (version + 1), 1e9 * 2 ** version, 1e9 * 2 ** version);
			// Update current version
			version++;
		}
		// Check research progress for Market TAs
		let researchCost = 0;
		if (!corp.hasResearched(division, market1)) researchCost += corp.getResearchCost(division, market1);
		if (!corp.hasResearched(division, market2)) researchCost += corp.getResearchCost(division, market2);
		if (researchCost > 0 && corp.getDivision(division).research >= 1.5 * researchCost) {
			if (!corp.hasResearched(division, market1)) corp.research(division, market1);
			if (!corp.hasResearched(division, market2)) {
				corp.research(division, market2);
				// Set Market TA.II on for the current selling versions
				corp.setProductMarketTA2(division, 'Tobacco v' + (version - 2), true);
				corp.setProductMarketTA2(division, 'Tobacco v' + (version - 1), true);
			}
		}
		// Upgrade Wilson analytics if we can
		if (corp.getCorporation().funds >= corp.getUpgradeLevelCost('Wilson Analytics')) corp.levelUpgrade('Wilson Analytics');
		// Check what is cheaper
		if (corp.getOfficeSizeUpgradeCost(division, mainCity, 15) < corp.getHireAdVertCost(division)) {
			// Upgrade office size in Aevum
			if (corp.getCorporation().funds >= corp.getOfficeSizeUpgradeCost(division, mainCity, 15)) {
				corp.upgradeOfficeSize(division, mainCity, 15);
				hireMaxEmployees(ns, division, mainCity);
				// Assign jobs
				const dist = Math.floor(corp.getOffice(division, mainCity).size / Object.keys(jobs).length);
				for (let job of Object.values(jobs)) {
					await corp.setAutoJobAssignment(division, mainCity, job, dist);
				}
			}
		}
		// Hire advert
		else if (corp.getCorporation().funds >= corp.getHireAdVertCost(division)) corp.hireAdVert(division);
		// Check for investors
		if (corp.getInvestmentOffer().funds >= 800e12) {
			// Exit autopilot
			ns.alert(`Time to go public. Turning off corporation autopilot...`);
			break;
		}
		await ns.sleep(1000);
	}
}