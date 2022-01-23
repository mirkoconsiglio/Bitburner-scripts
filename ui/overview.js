export async function main(ns) {
	const doc = eval('document');
	const hook0 = doc.getElementById('overview-extra-hook-0');
	const hook1 = doc.getElementById('overview-extra-hook-1');
	while (true) {
		try {
			const headers = [];
			const values = [];
			headers.push("Income\u00A0");
			values.push(`${ns.nFormat(ns.getScriptIncome()[0], '$0.000a')}`);
			headers.push("Karma");
			values.push(ns.heart.break());
			hook0.innerText = headers.join('\n');
			hook1.innerText = values.join('\n');
		} catch (err) {
			ns.print("ERROR: Update Skipped: " + String(err));
		}
		await ns.sleep(1000);
	}
}