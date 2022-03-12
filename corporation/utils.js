/**
 *
 * @returns {{operations: string, business: string, management: string, engineer: string, RAndD: string}} Jobs
 */
export function getJobs() {
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
 * @param ns
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
export function hireMaxEmployees(ns, division, city) {
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
export async function upgradeUpto(ns, upgrades) {
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
export async function buyMaterialsUpto(ns, division, city, materials) {
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
export async function upgradeWarehouseUpto(ns, division, city, level) {
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
export async function hireAdVertUpto(ns, division, level) {
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
export async function upgradeOffice(ns, division, city, size, positions) {
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
export async function investmentOffer(ns, amount, round = 5) {
	const corp = ns.corporation;
	if (corp.getInvestmentOffer().round > round) return;
	ns.print(`Waiting for investment offer of ${ns.nFormat(amount, '$0.000a')}`);
	while (corp.getInvestmentOffer().funds < amount) {
		await ns.sleep(1000);
	}
	if (corp.getInvestmentOffer().round > round) return; // In case investment offer is accepted manually
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
export async function makeProduct(ns, division, city, name, design = 0, marketing = 0) {
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
		ns.print(`Started to make a ${name} in ${division} (${city}) with ${ns.nFormat(design, '$0.000a')} for design and ${ns.nFormat(marketing, '$0.000a')} for marketing`);
	} else ns.print(`Already making/made ${name} in ${division} (${city})`);
}

// noinspection JSUnusedGlobalSymbols
/**
 * Function to wait for finishing making a product
 *
 * @param {NS} ns
 * @param {string} division
 * @param {string} name
 * @returns {Promise<void>}
 */
export async function finishProduct(ns, division, name) {
	ns.print(`Waiting for ${name} to finish in ${division}`);
	while (ns.corporation.getProduct(division, name).developmentProgress < 100) {
		await ns.sleep(1000);
	}
	ns.print(`Finished making ${name} in ${division}`);
}

// Function to get latest product version
export function getLatestVersion(ns, division) {
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
export function getEarliestVersion(ns, division) {
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
export async function expandIndustry(ns, industry, division) {
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
export async function expandCity(ns, division, city) {
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
export async function purchaseWarehouse(ns, division, city) {
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
export async function unlockUpgrade(ns, upgrade) {
	const corp = ns.corporation;
	if (!corp.hasUnlockUpgrade(upgrade)) {
		await moneyFor(ns, corp.getUnlockUpgradeCost, upgrade);
		corp.unlockUpgrade(upgrade);
		ns.print(`Purchased ${upgrade}`);
	} else ns.print(`Already purchased ${upgrade}`);
}

/**
 * Function to return important upgrades
 *
 * @returns {{market1: string, market2: string, capacity2: string, fulcrum: string, capacity1: string, lab: string}}
 */
export function getUpgrades() {
	return {
		lab: 'Hi-Tech R&D Laboratory',
		market1: 'Market-TA.I',
		market2: 'Market-TA.II',
		fulcrum: 'uPgrade: Fulcrum',
		capacity1: 'uPgrade: Capacity.I',
		capacity2: 'uPgrade: Capacity.II'
	};
}