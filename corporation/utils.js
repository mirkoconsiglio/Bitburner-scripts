export function getJobs() {
	return {
		operations: 'Operations',
		engineer: 'Engineer',
		business: 'Business',
		management: 'Management',
		RAndD: 'Research & Development'
	};
}

// Function to wait for enough money
async function moneyFor(ns, func, ...args) {
	while (func(...args) > ns.corporation.getCorporation().funds) {
		await ns.sleep(1000);
	}
}

// Function to wait for enough money
async function moneyForAmount(ns, amount) {
	while (amount > ns.corporation.getCorporation().funds) {
		await ns.sleep(1000);
	}
}

// Function to hire employees up to office size
export function hireMaxEmployees(ns, division, city) {
	const corp = ns.corporation;
	while (corp.getOffice(division, city).employees.length < corp.getOffice(division, city).size) {
		ns.print(`Hiring employees for ${division} (${city})`);
		corp.hireEmployee(division, city);
	}
}

// Function to upgrade list of upgrades upto a certain level
export async function upgradeUpto(ns, upgrades) {
	const corp = ns.corporation;
	for (let upgrade of upgrades) {
		while (corp.getUpgradeLevel(upgrade.name) < upgrade.level) {
			await moneyFor(ns, corp.getUpgradeLevelCost, upgrade.name);
			corp.levelUpgrade(upgrade.name);
			ns.print(`Upgraded ${upgrade.name} to level ${upgrade.level}`);
		}
	}
}

// Function to buy materials upto a certain quantity
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

// Function to upgrade warehouse up to certain level
export async function upgradeWarehouseUpto(ns, division, city, level) {
	const corp = ns.corporation;
	while (corp.getWarehouse(division, city).level < level) {
		await moneyFor(ns, corp.getUpgradeWarehouseCost, division, city);
		corp.upgradeWarehouse(division, city);
		ns.print(`Upgraded warehouse in ${division} (${city}) to level ${level}`);
	}
}

// Function to hire AdVert up to certain level
export async function hireAdVertUpto(ns, division, level) {
	const corp = ns.corporation;
	while (corp.getHireAdVertCount(division) < level) {
		await moneyFor(ns, corp.getHireAdVertCost, division);
		corp.hireAdVert(division);
		ns.print(`Hired AdVert in ${division} to level ${level}`);
	}
}

// Function to upgrade an office, hire maximum number of employees and assign them jobs
export async function upgradeOffice(ns, division, city, size, settings) {
	const corp = ns.corporation;
	const upgradeSize = size - corp.getOffice(division, city).size;
	if (upgradeSize > 0) {
		ns.print(`Upgrading office in ${division} (${city}) to ${size}`);
		await moneyFor(ns, corp.getOfficeSizeUpgradeCost, division, city, upgradeSize);
		corp.upgradeOfficeSize(division, city, upgradeSize);
	}
	hireMaxEmployees(ns, division, city);
	for (let setting of settings) {
		await corp.setAutoJobAssignment(division, city, setting.job, setting.num);
	}
}

// Function to wait for an investment offer of a certain amount
export async function investmentOffer(ns, amount, round = 5) {
	const corp = ns.corporation;
	if (corp.getInvestmentOffer().round > round) return;
	ns.print(`Waiting for investment offer of ${ns.nFormat(amount, '$0.000a')}`);
	while (corp.getInvestmentOffer().funds < amount) {
		await ns.sleep(1000);
	}
	corp.acceptInvestmentOffer();
}

// Function to start making a product
export async function makeProduct(ns, division, city, name, design = 0, marketing = 0) {
	const corp = ns.corporation;
	if (!corp.getDivision(division).products.includes(name)) {
		await moneyForAmount(ns, design + marketing);
		corp.makeProduct(division, city, name, design, marketing);
		ns.print(`Started to make a ${name} in ${division} (${city}) with ${ns.nFormat(design, '$0.000a')} for design and ${ns.nFormat(marketing, '$0.000a')} for marketing`);
	} else ns.print(`Already making ${name} in ${division} (${city})`);
}

// Function to finish making a product
export async function finishProduct(ns, division, name) {
	ns.print(`Waiting for ${name} to finish in ${division}`);
	while (ns.corporation.getProduct(division, name).developmentProgress < 100) {
		await ns.sleep(1000);
	}
}

// Function to expand industry
export async function expandIndustry(ns, industry, division) {
	const corp = ns.corporation;
	if (!corp.getCorporation().divisions.some(d => d.type === industry || d.name === division)) {
		ns.print(`Expanding to ${industry} industry: ${division}`);
		await moneyFor(ns, corp.getExpandIndustryCost, industry);
		corp.expandIndustry(industry, division);
	} else ns.print(`Already expanded to ${industry} industry: ${division}`);
}

// Function to expand city
export async function expandCity(ns, division, city) {
	const corp = ns.corporation;
	if (!corp.getDivision(division).cities.includes(city)) {
		await moneyFor(ns, corp.getExpandCityCost);
		corp.expandCity(division, city);
		ns.print(`Expanded to ${city} for ${division}`);
	} else ns.print(`Already expanded to ${city} for ${division}`);
}

// Function to purchase warehouse
export async function purchaseWarehouse(ns, division, city) {
	const corp = ns.corporation;
	if (!corp.hasWarehouse(division, city)) {
		await moneyFor(ns, corp.getPurchaseWarehouseCost);
		corp.purchaseWarehouse(division, city);
		ns.print(`Purchased warehouse in ${division} (${city})`);
	} else ns.print(`Already purchased warehouse in ${city} for ${division}`);
}

// Function to unlock upgrade
export async function unlockUpgrade(ns, upgrade) {
	const corp = ns.corporation;
	if (!corp.hasUnlockUpgrade(upgrade)) {
		await moneyFor(ns, corp.getUnlockUpgradeCost, upgrade);
		corp.unlockUpgrade(upgrade);
		ns.print(`Purchased ${upgrade}`);
	} else ns.print(`Already purchased ${upgrade}`);
}