export async function main(ns) {
	let servers = new Set(["home"]);
	scanAll("home", servers, ns);

	for (let server of servers) {
		let files = ns.ls(server);
		for (let file of files) {
			if (file.endsWith(".lit") || file.endsWith(".txt")) {
				await ns.scp(file, server, "home");
			}
		}
	}
}

function scanAll(host, servers, ns) {
	let hosts = ns.scan(host);
	for (let h of hosts) {
		if (!servers.has(h)) {
			servers.add(h);
			scanAll(h, servers, ns);
		}
	}
}