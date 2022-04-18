const fs = require('fs');
const path = require('path');
const http = require('https');

/**
 *
 * @param {string} dir
 * @param {string[]} arrayOfFiles
 * @returns {string[]}
 */
function getFilesRecursive(dir, arrayOfFiles) {
	try {
		const files = fs.readdirSync(dir);
		arrayOfFiles = arrayOfFiles || [];
		files.forEach(file => {
			const subfile = path.join(dir, file);
			if (file !== 'test') {
				if (fs.statSync(subfile).isDirectory()) arrayOfFiles = getFilesRecursive(subfile, arrayOfFiles);
				else arrayOfFiles.push(subfile);
			}
		});
		return arrayOfFiles.filter(file => (path.extname(file) === '.txt' || path.extname(file) === '.js'));
	} catch (err) {
		console.log(err);
	}
}

/**
 *
 * @param {string} dir
 * @returns {string[]}
 */
function getFiles(dir = __dirname) {
	const files = getFilesRecursive(`${dir}`);
	const relativeFiles = [];
	files.forEach(file => relativeFiles.push(path.relative(dir, file).replace(/\\/g, '/')));
	return relativeFiles;
}

/**
 *
 * @param {string} filename
 * @param {string} str
 */
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
const url = 'https://raw.githubusercontent.com/danielyxie/bitburner/dev/src/ScriptEditor/NetscriptDefinitions.d.ts';
http.get(url, response => response.pipe(index));