const url = 'https://raw.githubusercontent.com/mirkoconsiglio/Bitburner-scripts/master';
const listOfFiles = 'files.txt';

export async function main(ns) {
	ns.tprint('--- Downloading files ---');
	try {
		let download = await ns.wget(`${url}/${listOfFiles}`, listOfFiles);
		if (!download) throw listOfFiles;

		let files = ns.read(listOfFiles).split('\n');
		for (let file of files) {
			ns.tprint(`Downloading ${file}`);
			download = await ns.wget(`${url}/${file}`, file);
			if (!download) throw file;
		}
		ns.tprint('--- Download complete ---');
	} catch (file) {
		ns.tprint(`Could not download ${file}`);
	}
}