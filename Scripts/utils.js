export function printBoth(ns, str) {
	ns.print(str);
	ns.tprint(str);
}

export function scriptsToCopy() {
	return ['utils.js', '/hacking/daemon.js', '/hacking/hack.js', '/hacking/grow.js', '/hacking/weaken.js'];
}

export async function copyScriptsToAll(ns) {
	for (let server of getServers(ns)) {
		if (server !== 'home') {
			await ns.scp(scriptsToCopy(), 'home', server);
		}
	}
}

export function getServers(ns) {
	let servers = new Set(['home']);
	recursiveScan('home', servers, ns);
	return [...servers];
}

export function recursiveScan(host, servers, ns) {
	let hosts = ns.scan(host);
	for (let h of hosts) {
		if (!servers.has(h)) {
			servers.add(h);
			recursiveScan(h, servers, ns);
		}
	}
}

export function hackServer(ns, server) {
	if (ns.hasRootAccess(server)) return true;

	let portOpened = 0;
	if (ns.fileExists('BruteSSH.exe')) {
		ns.brutessh(server);
		portOpened++;
	}
	if (ns.fileExists('FTPCrack.exe')) {
		ns.ftpcrack(server);
		portOpened++;
	}
	if (ns.fileExists('HTTPWorm.exe')) {
		ns.httpworm(server);
		portOpened++;
	}
	if (ns.fileExists('relaySMTP.exe')) {
		ns.relaysmtp(server);
		portOpened++;
	}
	if (ns.fileExists('SQLInject.exe')) {
		ns.sqlinject(server);
		portOpened++;
	}

	if (ns.getServerNumPortsRequired(server) <= portOpened
		&& ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
		ns.nuke(server);
		return true;
	}

	return false;
}

export function getAccessibleServers(ns) {
	return getServers(ns).filter(server => hackServer(ns, server));
}