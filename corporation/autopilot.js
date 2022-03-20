// Requires WarehouseAPI and OfficeAPI
import {
	buyMaterialsUpto,
	expandCity,
	expandIndustry,
	getEarliestVersion,
	getJobs,
	getLatestVersion,
	getUpgrades,
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

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
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

/**
 *
 * @param {NS} ns
 * @param {string[]} cities
 * @param {Object<string, string>} jobs
 * @param {string} division
 * @returns {Promise<void>}
 */
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
		const positions = [
			{job: jobs.operations, num: 1},
			{job: jobs.engineer, num: 1},
			{job: jobs.business, num: 1}
		];
		await upgradeOffice(ns, division, city, 3, positions);
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

/**
 *
 * @param {NS} ns
 * @param {string[]} cities
 * @param {Object<string, string>} jobs
 * @param {string }division
 * @returns {Promise<void>}
 */
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
		const positions = [
			{job: jobs.operations, num: 2},
			{job: jobs.engineer, num: 2},
			{job: jobs.business, num: 1},
			{job: jobs.management, num: 2},
			{job: jobs.RAndD, num: 2}
		];
		await upgradeOffice(ns, division, city, 9, positions);
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

/**
 *
 * @param {NS} ns
 * @param {string[]} cities
 * @param {Object<string, string>} jobs
 * @param {string} division
 * @param {string} mainCity
 * @returns {Promise<void>}
 */
export async function part3(ns, cities, jobs, division, mainCity = 'Aevum') {
	// Expand into Tobacco industry
	await expandIndustry(ns, 'Tobacco', division);
	for (let city of cities) {
		// Expand to city
		await expandCity(ns, division, city);
		// Purchase warehouse
		await purchaseWarehouse(ns, division, city);
		if (city === mainCity) {
			// Upgrade Office size to 60
			const positions = [
				{job: jobs.operations, num: 6},
				{job: jobs.engineer, num: 6},
				{job: jobs.business, num: 6},
				{job: jobs.management, num: 6},
				{job: jobs.RAndD, num: 6}
			];
			await upgradeOffice(ns, division, city, 30, positions);
		} else {
			// Upgrade Office size to nine
			const positions = [
				{job: jobs.operations, num: 2},
				{job: jobs.engineer, num: 2},
				{job: jobs.business, num: 1},
				{job: jobs.management, num: 2},
				{job: jobs.RAndD, num: 2}
			];
			await upgradeOffice(ns, division, city, 9, positions);
		}
	}
	// Start making Tobacco v1
	if (getLatestVersion(ns, division) === 0) await makeProduct(ns, division, mainCity, 'Tobacco v1', 1e9, 1e9);
	// Get upgrades
	let upgrades = [
		{name: 'FocusWires', level: 20},
		{name: 'Neural Accelerators', level: 20},
		{name: 'Speech Processor Implants', level: 20},
		{name: 'Nuoptimal Nootropic Injector Implants', level: 20},
		{name: 'Wilson Analytics', level: 14}
	];
	await upgradeUpto(ns, upgrades);
}

// TODO: go public
// TODO: issue dividends
// TODO: buy other upgrades
/**
 *
 * @param {NS} ns
 * @param {string[]} cities
 * @param {Object<string, string>} jobs
 * @param {string} division
 * @param {string} mainCity
 * @returns {Promise<void>}
 */
export async function autopilot(ns, cities, jobs, division, mainCity = 'Aevum') {
	const corp = ns.corporation;
	const upgrades = getUpgrades();
	const minResearch = 50e3;
	let maxProducts = 3;
	// Start making next version of Tobacco if it has not already started
	let version = getLatestVersion(ns, division);
	await makeProduct(ns, division, mainCity, 'Tobacco v' + version, 1e9 * 2 ** (version - 1), 1e9 * 2 ** (version - 1));
	// Check tobacco progress
	// noinspection InfiniteLoopJS
	while (true) {
		if (corp.getProduct(division, 'Tobacco v' + version).developmentProgress >= 100) {
			// Start selling the developed version
			corp.sellProduct(division, mainCity, 'Tobacco v' + version, 'MAX', 'MP*' + (2 ** (version - 1)), true);
			// Set Market TA II if researched
			if (corp.hasResearched(division, upgrades.market2)) corp.setProductMarketTA2(division, 'Tobacco v' + version, true);
			// Discontinue earliest version
			if (corp.getDivision(division).products.length === maxProducts) corp.discontinueProduct(division, 'Tobacco v' + getEarliestVersion(ns, division));
			// Start making new version
			await makeProduct(ns, division, mainCity, 'Tobacco v' + (version + 1), 1e9 * 2 ** version, 1e9 * 2 ** version);
			// Update current version
			version++;
		}
		// Use hashes to boost research
		if (ns.hacknet.numHashes() >= ns.hacknet.hashCost('Exchange for Corporation Research') &&
			corp.getDivision(division).research < 3 * minResearch) ns.hacknet.spendHashes('Exchange for Corporation Research');
		// Check research progress for lab
		if (!corp.hasResearched(division, upgrades.lab) &&
			corp.getDivision(division).research - corp.getResearchCost(division, upgrades.lab) >= minResearch) {
			corp.research(division, upgrades.lab);
		}
		// Check research progress for Market TAs
		let researchCost = 0;
		if (!corp.hasResearched(division, upgrades.market1)) researchCost += corp.getResearchCost(division, upgrades.market1);
		if (!corp.hasResearched(division, upgrades.market2)) researchCost += corp.getResearchCost(division, upgrades.market2);
		if (researchCost > 0 && corp.getDivision(division).research - researchCost >= minResearch) {
			if (!corp.hasResearched(division, upgrades.market1)) corp.research(division, upgrades.market1);
			if (!corp.hasResearched(division, upgrades.market2)) {
				corp.research(division, upgrades.market2);
				// Set Market TA II on for the current selling versions
				corp.setProductMarketTA2(division, 'Tobacco v' + (version - 2), true);
				corp.setProductMarketTA2(division, 'Tobacco v' + (version - 1), true);
			}
		}
		// Check research progress for Fulcrum
		if (!corp.hasResearched(division, upgrades.fulcrum) &&
			corp.getDivision(division).research - corp.getResearchCost(division, upgrades.fulcrum) >= minResearch) {
			corp.research(division, upgrades.fulcrum);
		}
		// Check research progress for Capacity I
		if (!corp.hasResearched(division, upgrades.capacity1) &&
			corp.getDivision(division).research - corp.getResearchCost(division, upgrades.capacity1) >= minResearch) {
			corp.research(division, upgrades.capacity1);
			maxProducts++;
		}
		// Check research progress for Capacity II
		if (!corp.hasResearched(division, upgrades.capacity2) &&
			corp.getDivision(division).research - corp.getResearchCost(division, upgrades.capacity2) >= minResearch) {
			corp.research(division, upgrades.capacity2);
			maxProducts++;
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
		// If public
		if (corp.getCorporation().public) {
			// Sell a small amount of shares when they amount to more cash than we have on hand
			if (corp.getCorporation().shareSaleCooldown <= 0 &&
				corp.getCorporation().sharePrice * 1e6 > ns.getPlayer().money) corp.sellShares(1e6);
			// Buyback shares when we can
			else if (corp.getCorporation().issuedShares > 0) {
				if (ns.getPlayer().money > 2 * corp.getCorporation().issuedShares * corp.getCorporation().sharePrice * 1.1) {
					corp.buyBackShares(corp.getCorporation().issuedShares);
				}
			}
			// Check if we can unlock Shady Accounting
			if (corp.getCorporation().funds >= corp.getUnlockUpgradeCost('Shady Accounting') &&
				!corp.hasUnlockUpgrade('Shady Accounting')) corp.unlockUpgrade('Shady Accounting');
			// Check if we can unlock Government Partnership
			if (corp.getCorporation().funds >= corp.getUnlockUpgradeCost('Government Partnership') &&
				!corp.hasUnlockUpgrade('Government Partnership')) corp.unlockUpgrade('Government Partnership');
		}
		// Update every second
		await ns.sleep(1000);
	}
}