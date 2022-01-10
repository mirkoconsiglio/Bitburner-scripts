export async function main(ns) {
	let args = ns.flags([
		['university', 'ZB Institute of Technology'],
		['course', 'Leadership'],
		['level', 0]
	]);

	if (args.university === 'Summit University') ns.travelToCity('Aevum');
	else if (args.university === 'Rothman University') ns.travelToCity('Sector 12');
	else if (args.university === 'ZB Institute of Technology') ns.travelToCity('Volhaven');
	else {
		ns.tprint(`Invalid university.`);
		ns.exit();
	}

	if (args.course === 'Computer Science' ||
		args.course === 'Data Structures' ||
		args.course === 'Networks' ||
		args.course === 'Algorithms') await studyHack(ns, args.university, args.course, level);
	else if (args.course === 'Management' ||
		args.course === 'Leadership') await studyCha(ns, args.university, args.course, level);
	else {
		ns.tprint(`Invalid course.`);
		ns.exit();
	}
}

async function studyHack(ns, university, course, level) {
	ns.universityCourse(university, course);
	while (ns.getPlayer().hacking < level) {
		await ns.sleep(1000);
	}
}

async function studyCha(ns, university, course, level) {
	ns.universityCourse(university, course);
	while (ns.getPlayer().charisma < level) {
		await ns.sleep(1000);
	}
}