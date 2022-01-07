const fs = require('fs');
const path = require('path');

function getFiles(dir = __dirname) {
	let files = fs.readdirSync(dir);
	return files.filter(file => (path.extname(file) === '.txt' || path.extname(file) === '.js'));
}

function writeToFile(filename, str) {
	fs.writeFile(filename, str, (err) => {
		if (err) console.log(err);
		else console.log("File written successfully");
	});
}

writeToFile('files.txt', getFiles(process.cwd()).join('\n'));

