const fs = require('fs');
const path = require('path');
const http = require('https');

function getFilesRecursive(dir, arrayOfFiles) {
	try {
		let files = fs.readdirSync(dir);
		arrayOfFiles = arrayOfFiles || [];
		files.forEach(function (file) {
			let subfile = path.join(dir, file);
			if (fs.statSync(subfile).isDirectory()) {
				arrayOfFiles = getFilesRecursive(subfile, arrayOfFiles);
			} else {
				arrayOfFiles.push(subfile);
			}
		});
		return arrayOfFiles.filter(file => (path.extname(file) === '.txt' || path.extname(file) === '.js'));
	} catch (err) {
		console.log(err);
	}
}

function getFiles(dir = __dirname) {
	let files = getFilesRecursive(`${dir}`);
	let relativeFiles = [];
	files.forEach(file => relativeFiles.push(path.relative(dir, file).replace(/\\/g, '/')));
	return relativeFiles;
}

function writeToFile(filename, str) {
	fs.writeFile(filename, str, (err) => {
		if (err) console.log(err);
		else console.log('File written successfully');
	});
}

const dir = path.join(__dirname, '../');
const files = getFiles(`${dir}`);
const str = files.join('\n');
writeToFile('scripts.txt', str);

const index = fs.createWriteStream('../types/index.d.ts');
http.get('https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts',
	function (response) {
		response.pipe(index);
	});