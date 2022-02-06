export async function main(ns) {
	const args = ns.flags([
		['crime', false],
		['company', false],
		['faction', false],
		['gym', false],
		['recovery', false],
		['sync', false]
	]);

	let func;
	if (args.crime) func = ns.sleeve.setToCommitCrime;
	else if (args.company) func = ns.sleeve.setToCompanyWork;
	else if (args.faction) func = ns.sleeve.setToFactionWork;
	else if (args.gym) func = ns.sleeve.setToGymWorkout;
	else if (args.recovery) func = ns.sleeve.setToShockRecovery;
	else if (args.sync) func = ns.sleeve.setToSynchronize;
	else throw new Error(`Invalid sleeve action`);

	for (let i = 0; i < ns.sleeve.getNumSleeves(); i++) {
		func(i, ...args._);
	}
}