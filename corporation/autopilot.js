// Requires WarehouseAPI and OfficeAPI
import {formatMoney, getCities} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	ns.disableLog('ALL');
	const unlocked = ns.singularity.getOwnedSourceFiles().some(s => s.n === 3 && s.lvl === 3);
	if (!unlocked && !ns.corporation.hasUnlockUpgrade('Warehouse API')) throw new Error(`This script requires the Warehouse API`);
	if (!unlocked && !ns.corporation.hasUnlockUpgrade('Office API')) throw new Error(`This script requires the Office API`);
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
 * @param {Object<string>} jobs
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
 * @param {Object<string>} jobs
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
 * @param {Object<string>} jobs
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
}

/**
 *
 * @param {NS} ns
 * @param {string[]} cities
 * @param {Object<string>} jobs
 * @param {string} division
 * @param {string} mainCity
 * @returns {Promise<void>}
 */
export async function autopilot(ns, cities, jobs, division, mainCity = 'Aevum') {
	const corp = ns.corporation;
	const upgrades = getResearch();
	const minResearch = 50e3;
	let maxProducts = 3;
	if (corp.hasResearched(division, upgrades.capacity1)) maxProducts++;
	if (corp.hasResearched(division, upgrades.capacity2)) maxProducts++;
	// Get latest version
	let version = getLatestVersion(ns, division);
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
		if (corp.hasResearched(division, upgrades.lab) && researchCost > 0 &&
			corp.getDivision(division).research - researchCost >= minResearch) {
			if (!corp.hasResearched(division, upgrades.market1)) corp.research(division, upgrades.market1);
			if (!corp.hasResearched(division, upgrades.market2)) {
				corp.research(division, upgrades.market2);
				// Set Market TA II on for the current selling versions
				for (const product of corp.getDivision(division).products) corp.setProductMarketTA2(division, product, true);
			}
		}
		// Check research progress for Fulcrum
		if (corp.hasResearched(division, upgrades.market2) && !corp.hasResearched(division, upgrades.fulcrum) &&
			corp.getDivision(division).research - corp.getResearchCost(division, upgrades.fulcrum) >= minResearch) {
			corp.research(division, upgrades.fulcrum);
		}
		// Check research progress for Capacity I
		if (corp.hasResearched(division, upgrades.fulcrum) && !corp.hasResearched(division, upgrades.capacity1) &&
			corp.getDivision(division).research - corp.getResearchCost(division, upgrades.capacity1) >= minResearch) {
			corp.research(division, upgrades.capacity1);
			maxProducts++;
		}
		// Check research progress for Capacity II
		if (corp.hasResearched(division, upgrades.capacity1) && !corp.hasResearched(division, upgrades.capacity2) &&
			corp.getDivision(division).research - corp.getResearchCost(division, upgrades.capacity2) >= minResearch) {
			corp.research(division, upgrades.capacity2);
			maxProducts++;
		}
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
		// Level upgrades
		levelUpgrades(ns, 0.1);
		// Go public
		if (corp.getCorporation().revenue >= 1e18) corp.goPublic(0);
		// If public
		if (corp.getCorporation().public) {
			// Sell a small amount of shares when they amount to more cash than we have on hand
			if (corp.getCorporation().shareSaleCooldown <= 0 &&
				corp.getCorporation().sharePrice * 1e6 > ns.getPlayer().money) corp.sellShares(1e6);
			// Buyback shares when we can
			else if (corp.getCorporation().issuedShares > 0 &&
				ns.getPlayer().money > 2 * corp.getCorporation().issuedShares * corp.getCorporation().sharePrice)
				corp.buyBackShares(corp.getCorporation().issuedShares);
			// Check if we can unlock Shady Accounting
			if (corp.getCorporation().funds >= corp.getUnlockUpgradeCost('Shady Accounting') &&
				!corp.hasUnlockUpgrade('Shady Accounting')) corp.unlockUpgrade('Shady Accounting');
			// Check if we can unlock Government Partnership
			if (corp.getCorporation().funds >= corp.getUnlockUpgradeCost('Government Partnership') &&
				!corp.hasUnlockUpgrade('Government Partnership')) corp.unlockUpgrade('Government Partnership');
			// Issue dividends
			corp.issueDividends(dividendsPercentage(ns));
		}
		// Update every second
		await ns.sleep(1000);
	}
}

/**
 * Function to level the cheapest upgrade if under a certain percentage of the corp funds
 *
 * @param {NS} ns
 * @param {number} percent
 */
function levelUpgrades(ns, percent) {
	const corp = ns.corporation;
	let cheapestCost = Infinity;
	let cheapestUpgrade;
	for (const upgrade of getUpgrades()) {
		const cost = corp.getUpgradeLevelCost(upgrade);
		if (cost < cheapestCost) {
			cheapestUpgrade = upgrade;
			cheapestCost = cost;
		}
	}
	if (percent * corp.getCorporation().funds >= cheapestCost) corp.levelUpgrade(cheapestUpgrade);
}

/**
 * Function to return a list of upgrades
 *
 * @return {string[]}
 */
function getUpgrades() {
	return [
		'Smart Factories',
		'Smart Storage',
		'DreamSense',
		'Wilson Analytics',
		'Nuoptimal Nootropic Injector Implants',
		'Speech Processor Implants',
		'Neural Accelerators',
		'FocusWires',
		'ABC SalesBots',
		'Project Insight'
	];
}

/**
 *
 * @param {NS} ns
 * @returns {number}
 */
function dividendsPercentage(ns) {
	return Math.max(0, Math.min(0.99, Math.log(ns.corporation.getCorporation().revenue) / (20 * Math.log(1000))));
}

/**
 *
 * @returns {Object<string>} Jobs
 */
function getJobs() {
	return {
		operations: 'Operations',
		engineer: 'Engineer',
		business: 'Business',
		management: 'Management',
		RAndD: 'Research & Development'
	};
}


/**
 * Function to wait for enough money
 *
 * @param {NS} ns
 * @param {function} func
 * @param {*[]} args
 * @returns {Promise<void>}
 */
async function moneyFor(ns, func, ...args) {
	while (func(...args) > ns.corporation.getCorporation().funds) {
		await ns.sleep(1000);
	}
}

/**
 * Function to wait for enough money
 *
 * @param {NS} ns
 * @param {number} amount
 * @returns {Promise<void>}
 */
async function moneyForAmount(ns, amount) {
	while (amount > ns.corporation.getCorporation().funds) {
		await ns.sleep(1000);
	}
}

/**
 * Function to hire employees up to office size
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} city
 */
function hireMaxEmployees(ns, division, city) {
	const corp = ns.corporation;
	ns.print(`Hiring employees for ${division} (${city})`);
	while (corp.getOffice(division, city).employees.length < corp.getOffice(division, city).size) {
		corp.hireEmployee(division, city);
	}
}

/**
 * Function to upgrade list of upgrades upto a certain level
 *
 * @param {NS} ns
 * @param {Object<string, number>[]} upgrades
 * @returns {Promise<void>}
 */
async function upgradeUpto(ns, upgrades) {
	const corp = ns.corporation;
	for (let upgrade of upgrades) {
		while (corp.getUpgradeLevel(upgrade.name) < upgrade.level) {
			await moneyFor(ns, corp.getUpgradeLevelCost, upgrade.name);
			corp.levelUpgrade(upgrade.name);
			ns.print(`Upgraded ${upgrade.name} to level ${corp.getUpgradeLevel(upgrade.name)}`);
		}
	}
}

/**
 * Function to buy materials upto a certain quantity
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} city
 * @param {Object<string, number>[]} materials
 * @returns {Promise<void>}
 */
async function buyMaterialsUpto(ns, division, city, materials) {
	const corp = ns.corporation;
	for (let material of materials) {
		const curQty = corp.getMaterial(division, city, material.name).qty;
		if (curQty < material.qty) {
			ns.print(`Buying ${material.name} for ${division} (${city})`);
			corp.buyMaterial(division, city, material.name, (material.qty - curQty) / 10);
		}
	}
	while (true) {
		let breakOut = true;
		for (let material of materials) {
			const curQty = corp.getMaterial(division, city, material.name).qty;
			if (curQty >= material.qty) corp.buyMaterial(division, city, material.name, 0);
			else breakOut = false;
		}
		if (breakOut) break;
		await ns.sleep(100);
	}
}

/**
 * Function to upgrade warehouse up to certain level
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} city
 * @param {number} level
 * @returns {Promise<void>}
 */
async function upgradeWarehouseUpto(ns, division, city, level) {
	const corp = ns.corporation;
	while (corp.getWarehouse(division, city).level < level) {
		await moneyFor(ns, corp.getUpgradeWarehouseCost, division, city);
		corp.upgradeWarehouse(division, city);
		ns.print(`Upgraded warehouse in ${division} (${city}) to level ${corp.getWarehouse(division, city).level}`);
	}
}

/**
 * Function to hire AdVert up to certain level
 *
 * @param {NS} ns
 * @param {string} division
 * @param {number} level
 * @returns {Promise<void>}
 */
async function hireAdVertUpto(ns, division, level) {
	const corp = ns.corporation;
	while (corp.getHireAdVertCount(division) < level) {
		await moneyFor(ns, corp.getHireAdVertCost, division);
		corp.hireAdVert(division);
		ns.print(`Hired AdVert in ${division} to level ${level}`);
	}
}

/**
 * Function to upgrade an office, hire maximum number of employees and assign them jobs
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} city
 * @param {number} size
 * @param {Object<string, number>[]} positions
 * @returns {Promise<void>}
 */
async function upgradeOffice(ns, division, city, size, positions) {
	const corp = ns.corporation;
	const upgradeSize = size - corp.getOffice(division, city).size;
	if (upgradeSize > 0) {
		ns.print(`Upgrading office in ${division} (${city}) to ${size}`);
		await moneyFor(ns, corp.getOfficeSizeUpgradeCost, division, city, upgradeSize);
		corp.upgradeOfficeSize(division, city, upgradeSize);
	}
	hireMaxEmployees(ns, division, city);
	const allPositions = getPositions(ns, division, city);
	for (let position of positions) {
		if (allPositions[position.job] !== position.num) await corp.setAutoJobAssignment(division, city, position.job, position.num);
	}
}

/**
 *
 * @param {NS} ns
 * @param division
 * @param city
 * @returns {Object<string, number>[]}
 */
function getPositions(ns, division, city) {
	const corp = ns.corporation;
	const positions = {};
	const employeeNames = corp.getOffice(division, city).employees;
	for (let employeeName of employeeNames) {
		const employeePos = corp.getEmployee(division, city, employeeName).pos;
		positions[employeePos] = (positions[employeePos] || 0) + 1;
	}
	return positions;
}

/**
 * Function to wait for an investment offer of a certain amount
 *
 * @param {NS} ns
 * @param {number} amount
 * @param {number} round
 * @returns {Promise<void>}
 */
async function investmentOffer(ns, amount, round = 5) {
	const corp = ns.corporation;
	if (corp.getInvestmentOffer().round > round) return;
	ns.print(`Waiting for investment offer of ${formatMoney(ns, amount)}`);
	// Wait for investment
	while (corp.getInvestmentOffer().funds < amount) {
		if (corp.getInvestmentOffer().round > round) {
			ns.print(`Already accepted investment offer at round ${corp.getInvestmentOffer().round}, ` +
				`or it was manually accepted now.`);
			return;
		}
		amount -= corp.getCorporation().revenue; // Take revenue into account
		// Pump in corp funds if we have hashes
		if (ns.hacknet.numHashes() >= ns.hacknet.hashCost('Sell for Corporation Funds')) {
			ns.hacknet.spendHashes('Sell for Corporation Funds');
			amount -= 1e9;
		}
		await ns.sleep(1000);
	}
	ns.print(`Accepted investment offer of ${formatMoney(ns, corp.getInvestmentOffer().funds)}`);
	corp.acceptInvestmentOffer();
}

/**
 * Function to start making a product
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} city
 * @param {string} name
 * @param {number} design
 * @param {number} marketing
 * @returns {Promise<void>}
 */
async function makeProduct(ns, division, city, name, design = 0, marketing = 0) {
	const corp = ns.corporation;
	const products = corp.getDivision(division).products;
	const proposedVersion = parseVersion(name);
	let currentBestVersion = 0;
	for (let product of products) {
		let version = parseVersion(product);
		if (version > currentBestVersion) currentBestVersion = version;
	}
	if (proposedVersion > currentBestVersion) {
		await moneyForAmount(ns, design + marketing);
		corp.makeProduct(division, city, name, design, marketing);
		ns.print(`Started to make ${name} in ${division} (${city}) with ${formatMoney(ns, design)} for design and ${formatMoney(ns, marketing)} for marketing`);
	} else ns.print(`Already making/made ${name} in ${division} (${city})`);
}

/**
 * Function to get latest product version
 *
 * @param {NS} ns
 * @param {string} division
 * @return {number}
 */
function getLatestVersion(ns, division) {
	const products = ns.corporation.getDivision(division).products;
	let latestVersion = 0;
	for (let product of products) {
		let version = parseVersion(product);
		if (version > latestVersion) latestVersion = version;
	}
	return latestVersion;
}

/**
 * Function to get earliest product version
 *
 * @param {NS} ns
 * @param {string} division
 * @returns {number}
 */
function getEarliestVersion(ns, division) {
	const products = ns.corporation.getDivision(division).products;
	let earliestVersion = Number.MAX_SAFE_INTEGER;
	for (let product of products) {
		let version = parseVersion(product);
		if (version < earliestVersion) earliestVersion = version;
	}
	return earliestVersion;
}

/**
 * Function to parse product version from name
 *
 * @param {string} name
 * @returns {number}
 */
function parseVersion(name) {
	let version = '';
	for (let i = 1; i <= name.length; i++) {
		let slice = name.slice(-i);
		if (!isNaN(slice)) version = slice;
		else if (version === '') throw new Error(`Product name must end with version number`);
		else return parseInt(version);
	}
}

/**
 * Function to expand industry
 *
 * @param {NS} ns
 * @param {string} industry
 * @param {string} division
 * @returns {Promise<void>}
 */
async function expandIndustry(ns, industry, division) {
	const corp = ns.corporation;
	if (!corp.getCorporation().divisions.some(d => d.type === industry || d.name === division)) {
		ns.print(`Expanding to ${industry} industry: ${division}`);
		await moneyFor(ns, corp.getExpandIndustryCost, industry);
		corp.expandIndustry(industry, division);
	} else ns.print(`Already expanded to ${industry} industry: ${division}`);
}


/**
 * Function to expand city
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} city
 * @returns {Promise<void>}
 */
async function expandCity(ns, division, city) {
	const corp = ns.corporation;
	if (!corp.getDivision(division).cities.includes(city)) {
		await moneyFor(ns, corp.getExpandCityCost);
		corp.expandCity(division, city);
		ns.print(`Expanded to ${city} for ${division}`);
	} else ns.print(`Already expanded to ${city} for ${division}`);
}

/**
 * Function to purchase warehouse
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} city
 * @returns {Promise<void>}
 */
async function purchaseWarehouse(ns, division, city) {
	const corp = ns.corporation;
	if (!corp.hasWarehouse(division, city)) {
		await moneyFor(ns, corp.getPurchaseWarehouseCost);
		corp.purchaseWarehouse(division, city);
		ns.print(`Purchased warehouse in ${division} (${city})`);
	} else ns.print(`Already purchased warehouse in ${city} for ${division}`);
}

/**
 * Function to unlock upgrade
 *
 * @param {NS} ns
 * @param {string} upgrade
 * @returns {Promise<void>}
 */
async function unlockUpgrade(ns, upgrade) {
	const corp = ns.corporation;
	if (!corp.hasUnlockUpgrade(upgrade)) {
		await moneyFor(ns, corp.getUnlockUpgradeCost, upgrade);
		corp.unlockUpgrade(upgrade);
		ns.print(`Purchased ${upgrade}`);
	} else ns.print(`Already purchased ${upgrade}`);
}

/**
 * Function to return important research
 *
 * @returns {Object<string>}
 */
function getResearch() {
	return {
		lab: 'Hi-Tech R&D Laboratory',
		market1: 'Market-TA.I',
		market2: 'Market-TA.II',
		fulcrum: 'uPgrade: Fulcrum',
		capacity1: 'uPgrade: Capacity.I',
		capacity2: 'uPgrade: Capacity.II'
	};
}