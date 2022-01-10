export async function main(ns) {
	let args = ns.flags([
		['str', false],
		['def', false],
		['dex', false],
		['agi', false],
		['all', false],
		['gym', 'Powerhouse Gym'],
		['level', 0]
	]);

	if (args.gym === 'Crush Fitness Gym' || args.gym === 'Snap Fitness Gym') ns.travelToCity('Aevum');
	else if (args.gym === 'Iron Gym' || args.gym === 'Powerhouse Gym') ns.travelToCity('Sector 12');
	else if (args.gym === 'Millenium Fitness Gym') ns.travelToCity('Volhaven');
	else {
		ns.tprint(`Invalid gym.`);
		ns.exit();
	}

	if (args.str || args.all) await workOutStr(ns, args.gym, level);
	if (args.def || args.all) await workOutDef(ns, args.gym, level);
	if (args.dex || args.all) await workOutDex(ns, args.gym, level);
	if (args.agi || args.all) await workOutAgi(ns, args.gym, level);
}

async function workOutStr(ns, gym, level) {
	ns.gymWorkout(gym, 'str');
	while (ns.getPlayer().strength < level) {
		await ns.sleep(1000);
	}
}

async function workOutDef(ns, gym, level) {
	ns.gymWorkout(gym, 'def');
	while (ns.getPlayer().defense < level) {
		await ns.sleep(1000);
	}
}

async function workOutDex(ns, gym, level) {
	ns.gymWorkout(gym, 'dex');
	while (ns.getPlayer().dexterity < level) {
		await ns.sleep(1000);
	}
}

async function workOutAgi(ns, gym, level) {
	ns.gymWorkout(gym, 'agi');
	while (ns.getPlayer().agility < level) {
		await ns.sleep(1000);
	}
}