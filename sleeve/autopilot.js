export async function main(ns) {
	ns.disableLog('ALL');
	while (true) {
		ns.clearLog();
		const task = (ns.heart.break() > -54e3) ? 'crime' : 'shock-recovery';
		for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
			const sleeveStats = ns.sleeve.getSleeveStats(i);
			if (task === 'crime' || sleeveStats.shock === 0) {
				const crime = sleeveStats.strength < 100 ? 'Mug' : 'Homicide';
				if (ns.sleeve.getTask(i).crime !== crime) ns.sleeve.setToCommitCrime(i, crime);
			} else if (ns.sleeve.getTask(i).task !== 'Shock Recovery') ns.sleeve.setToShockRecovery(i);
			ns.print(ns.sleeve.getTask(i));
		}
		await ns.sleep(1000);
	}
}