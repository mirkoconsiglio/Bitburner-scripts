const url = 'https://raw.githubusercontent.com/mirkoconsiglio/Bitburner-scripts/master';
const listOfFiles = 'files.txt';

export async function main(ns) {
	await ns.wget(`${url}/${listOfFiles}`, listOfFiles);
	let handle = ns.read(listOfFiles);
	let files = handle.split("\r\n");
	for (let file of files) {
		await ns.wget(`${url}/${file}`, file);
	}
}