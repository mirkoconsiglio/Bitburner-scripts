const fs = require('fs');
const path = require('path');

function getFiles(dir = __dirname) {
	let files = fs.readdirSync(dir);
	return files.filter(file => (path.extname(file) === '.txt' || path.extname(file) === '.js'));
}

const writeStream = fs.createWriteStream('files.txt');
getFiles(process.cwd()).forEach(file => writeStream.write(`${file}\n`));
writeStream.end();
