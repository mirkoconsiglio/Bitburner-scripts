export async function main(ns) {
	const args = ns.flags([
		['university', 'ZB Institute of Technology'],
		['course', 'Leadership']
	]);

	if (args.university === 'Summit University') ns.travelToCity('Aevum');
	else if (args.university === 'Rothman University') ns.travelToCity('Sector-12');
	else if (args.university === 'ZB Institute of Technology') ns.travelToCity('Volhaven');
	else throw new Error(`Invalid university`);

	if (args.course === 'Computer Science' ||
		args.course === 'Data Structures' ||
		args.course === 'Networks' ||
		args.course === 'Algorithms') await studyHack(ns, args.university, args.course, args._[0]);
	else if (args.course === 'Management' ||
		args.course === 'Leadership') await studyCha(ns, args.university, args.course, args._[0]);
	else throw new Error(`Invalid course`);
}

async function studyHack(ns, university, course, level) {
	ns.universityCourse(university, course);
	while (ns.getPlayer().hacking < level) {
		await ns.sleep(1000);
	}
	ns.stopAction();
}

async function studyCha(ns, university, course, level) {
	ns.universityCourse(university, course);
	while (ns.getPlayer().charisma < level) {
		await ns.sleep(1000);
	}
	ns.stopAction();
}