const fs = require('fs');
const path = require('path');

function getFilesRecursive(dir, arrayOfFiles) {
	try {
		let files = fs.readdirSync(dir);
		arrayOfFiles = arrayOfFiles || [];
		files.forEach(function(file) {
			let subfile = path.join(dir, file);
			if (fs.statSync(subfile).isDirectory()) {
				arrayOfFiles = getFilesRecursive(subfile, arrayOfFiles);
			} else {
				arrayOfFiles.push(subfile);
			}
		});
		return arrayOfFiles.filter(file => (path.extname(file) === '.txt' || path.extname(file) === '.js'));
	} catch(err) {
		console.log(err);
		return null;
	}
}

function getFiles(dir = __dirname) {
	let files = getFilesRecursive(`${dir}`);
	let relativeFiles = [];
	files.forEach(file => relativeFiles.push(path.relative(dir, file)));
	return relativeFiles;
}

function writeToFile(filename, str) {
	fs.writeFile(filename, str, (err) => {
		if (err) console.log(err);
		else console.log("File written successfully");
	});
}

let dir = path.join(__dirname, '../Scripts/');
let files = getFiles(`${dir}`);
let str = files.join('\n');
writeToFile('scripts.txt', str);

