import {getServers, printBoth} from '/utils.js';

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	contractor(ns);
}

/**
 *
 * @param {NS} ns
 * @returns {boolean}
 */
export function contractor(ns) {
	for (let server of getServers(ns)) {
		const files = ns.ls(server, '.cct');
		for (let file of files) {
			const contract = ns.codingcontract.getContractType(file, server);
			const data = ns.codingcontract.getData(file, server);
			let solution;
			switch (contract) {
				case 'Find Largest Prime Factor':
					solution = largestPrimeFactor(data);
					break;
				case 'Subarray with Maximum Sum':
					solution = subarrayMaxSum(data);
					break;
				case 'Spiralize Matrix':
					solution = spiralizeMatrix(data);
					break;
				case 'Minimum Path Sum in a Triangle':
					solution = minPathSum(data);
					break;
				case 'Unique Paths in a Grid I':
					solution = uniquePathsI(data);
					break;
				case 'Unique Paths in a Grid II':
					solution = uniquePathsII(data);
					break;
				case 'Shortest Path in a Grid':
					solution = shortestPath(data);
					break;
				case 'Algorithmic Stock Trader I':
					solution = stockTrader(1, data);
					break;
				case 'Algorithmic Stock Trader II':
					solution = stockTrader(Math.floor(data.length / 2), data);
					break;
				case 'Algorithmic Stock Trader III':
					solution = stockTrader(2, data);
					break;
				case 'Algorithmic Stock Trader IV':
					solution = stockTrader(...data);
					break;
				case 'Generate IP Addresses':
					solution = genIPAddresses(data);
					break;
				case 'Merge Overlapping Intervals':
					solution = mergeOverlappingIntervals(data);
					break;
				case 'Array Jumping Game':
					solution = arrayJumpingGame(data);
					break;
				case 'Array Jumping Game II':
					solution = arrayJumpingGameII(data);
					break;
				case 'Total Ways to Sum':
					solution = totalWaysToSum(data);
					break;
				case 'Total Ways to Sum II':
					solution = totalWaysToSumII(data);
					break;
				case 'Find All Valid Math Expressions':
					solution = validMathExpressions(data);
					break;
				case 'Sanitize Parentheses in Expression':
					solution = sanitizeParentheses(data);
					break;
				case 'HammingCodes: Integer to Encoded Binary':
					solution = hammingEncode(data);
					break;
				case 'HammingCodes: Encoded Binary to Integer':
					solution = hammingDecode(data);
					break;
				case 'Proper 2-Coloring of a Graph':
					solution = twoColoring(data);
					break;
				case 'Compression I: RLE Compression':
					solution = runLengthEncoding(data);
					break;
				case 'Compression II: LZ Decompression':
					solution = decompressLZ(data);
					break;
				case 'Compression III: LZ Compression':
					solution = compressLZ(data);
					break;
				case 'Encryption I: Caesar Cipher':
					solution = caesar(data);
					break;
				case 'Encryption II: Vigenère Cipher':
					solution = vigenere(data);
					break;
				default:
					ns.print(`Found ${file} on ${server} of type: ${contract}. This does not have a solver yet.`);
					continue;
			}
			const result = ns.codingcontract.attempt(solution, file, server, {returnReward: true});
			if (result) {
				printBoth(ns, `Solved ${file} on ${server} of type: ${contract}. ${result}.`);
			} else {
				printBoth(ns, `Could not solve ${file} on ${server} of type: ${contract}...`);
				printBoth(ns, `Disabling contractor...`);
				return false;
			}
		}
	}
	return true;
}

/**
 *
 * @param {number} n
 * @returns {number}
 */
function largestPrimeFactor(n) {
	let maxPrime = 0;
	while (n % 2 === 0) {
		n = Math.floor(n / 2);
		maxPrime = 2;
	}
	for (let i = 3; i <= Math.floor(Math.sqrt(n)) + 1; i = i + 2) {
		while (n % i === 0) {
			n = Math.floor(n / i);
			maxPrime = i;
		}
	}
	if (n > 2) maxPrime = n;

	return maxPrime;
}

/**
 *
 * @param {number[]} array
 * @returns {number}
 */
function subarrayMaxSum(array) {
	const sumReduce = (a, b) => a + b;
	let maxSum = -Infinity;
	let sum;
	for (let i = 0; i < array.length; i++) {
		for (let j = i; j < array.length; j++) {
			sum = array.slice(i, j + 1).reduce(sumReduce);
			if (sum > maxSum) maxSum = sum;
		}
	}
	return maxSum;
}

/**
 *
 * @param {number[][]} matrix
 * @returns {number[][]}
 */
function spiralizeMatrix(matrix) {
	const rows = matrix.length;
	const cols = matrix[0].length;

	let maxrow = rows - 1;
	let maxcol = cols - 1;
	let minrow = 0;
	let mincol = 0;

	let row = 0;
	let col = 0;

	let list = [];
	while (list.length < rows * cols) {
		if (maxrow >= minrow) {
			for (col; col <= maxcol; col++) list.push(matrix[row][col]);
			minrow++;
			row++;
			col--;
		}
		if (maxcol >= mincol) {
			for (row; row <= maxrow; row++) list.push(matrix[row][col]);
			maxcol--;
			col--;
			row--;
		}
		if (minrow <= maxrow) {
			for (col; col >= mincol; col--) list.push(matrix[row][col]);
			maxrow--;
			col++;
			row--;
		}
		if (mincol <= maxcol) {
			for (row; row >= minrow; row--) list.push(matrix[row][col]);
			mincol++;
			row++;
			col++;
		}
	}
	return list;
}

/**
 *
 * @param {number[][]} data
 * @returns {number}
 */
function minPathSum(data) {
	const totalPaths = Math.pow(2, data.length - 1);
	let minSum = Infinity;
	for (let i = 0; i < totalPaths; i++) {
		let bin = i.toString(2);
		while (bin.length < data.length - 1) {
			bin = '0' + bin;
		}

		let sum = data[0][0];
		let k = 0;
		for (let j = 1; j < data.length; j++) {
			let index = parseInt(bin.charAt(j - 1));
			k += index;
			sum += data[j][k];
		}

		if (sum < minSum) minSum = sum;
	}
	return minSum;
}

/**
 *
 * @param {[number, number]} data
 * @returns {number}
 */
function uniquePathsI(data) {
	const [m, n] = data;
	const f = [];
	const x = factorial(f, m + n - 2);
	const y = factorial(f, m - 1);
	const z = factorial(f, n - 1);
	return x / (y * z);
}

/**
 *
 * @param {number[]} f
 * @param {number} n
 * @returns {number}
 */
function factorial(f, n) {
	if (n === 0 || n === 1) return 1;
	if (f[n] > 0) return f[n];
	return f[n] = n * factorial(f, n - 1);
}

/**
 *
 * @param {number[][]} grid
 * @returns {number}
 */
function uniquePathsII(grid) {
	const gridSum = [];
	for (let i of grid) {
		gridSum.push(i.slice());
	}
	for (let i = 0; i < gridSum.length; i++) {
		for (let j = 0; j < gridSum[0].length; j++) {
			if (gridSum[i][j] === 1) {
				gridSum[i][j] = 0;
			} else if (i === 0 && j === 0) {
				gridSum[0][0] = 1;
			} else {
				gridSum[i][j] = (i > 0 ? gridSum[i - 1][j] : 0) + (j > 0 ? gridSum[i][j - 1] : 0);
			}
		}
	}
	return gridSum[gridSum.length - 1][gridSum[0].length - 1];
}

/**
 *
 * @param {number[]} array
 * @returns {string}
 */
function shortestPath(array) {
	const dist = array.map(arr => new Array(arr.length).fill(Infinity));
	const prev = array.map(arr => new Array(arr.length).fill(undefined));
	const path = array.map(arr => new Array(arr.length).fill(undefined));
	const queue = [];
	array.forEach((arr, i) => arr.forEach((a, j) => {
		if (a === 0) queue.push([i, j]);
	}));

	dist[0][0] = 0;
	const height = array.length;
	const length = array[height - 1].length;
	const target = [height - 1, length - 1];
	while (queue.length > 0) {
		let u;
		let d = Infinity;
		let idx;
		queue.forEach(([i, j], k) => {
			if (dist[i][j] < d) {
				u = [i, j];
				d = dist[i][j];
				idx = k;
			}
		});
		if (JSON.stringify(u) === JSON.stringify(target)) {
			let str = '';
			let [a, b] = target;
			if (prev[a][b] || (a === 0 && b === 0)) {
				while (prev[a][b]) {
					str = path[a][b] + str;
					[a, b] = prev[a][b];
				}
			}
			return str;
		}
		queue.splice(idx, 1);
		if (u === undefined) continue;
		const [a, b] = u;
		for (const [s, i, j] of [['D', a + 1, b], ['U', a - 1, b], ['R', a, b + 1], ['L', a, b - 1]]) {
			if (i < 0 || i >= height || j < 0 || j >= length) continue; // Index over edge
			if (array[i][j] === 1) continue; // We've hit a wall;
			if (!queue.some(([k, l]) => k === i && l === j)) continue; // Vertex not in queue
			const alt = dist[a][b] + 1;
			if (alt < dist[i][j]) {
				dist[i][j] = alt;
				prev[i][j] = u;
				path[i][j] = s;
			}
		}
	}
	return '';
}

/**
 *
 * @param {number} maxTrades
 * @param {number[]} stockPrices
 * @returns {number}
 */
function stockTrader(maxTrades, stockPrices) {
	let tempStr = '[0';
	for (let i = 0; i < stockPrices.length - 1; i++) {
		tempStr += ',0';
	}
	tempStr += ']';
	let tempArr = '[' + tempStr;
	for (let i = 0; i < maxTrades - 1; i++) {
		tempArr += ',' + tempStr;
	}
	tempArr += ']';

	const highestProfit = JSON.parse(tempArr);

	for (let i = 0; i < maxTrades; i++) {
		for (let j = 0; j < stockPrices.length - 1; j++) {
			for (let k = j + 1; k < stockPrices.length; k++) {
				if (i > 0 && j > 0 && k > 0) {
					highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
				} else if (i > 0 && j > 0) {
					highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i - 1][j - 1] + stockPrices[k] - stockPrices[j]);
				} else if (i > 0 && k > 0) {
					highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i - 1][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
				} else if (j > 0 && k > 0) {
					highestProfit[i][k] = Math.max(highestProfit[i][k], highestProfit[i][k - 1], stockPrices[k] - stockPrices[j]);
				} else {
					highestProfit[i][k] = Math.max(highestProfit[i][k], stockPrices[k] - stockPrices[j]);
				}
			}
		}
	}
	return highestProfit[maxTrades - 1][stockPrices.length - 1];
}

/**
 *
 * @param {string} str
 * @returns {string[]}
 */
function genIPAddresses(str) {
	const ips = [];
	for (let i = 1; i < str.length - 2; i++) {
		for (let j = i + 1; j < str.length - 1; j++) {
			for (let k = j + 1; k < str.length; k++) {
				const ip = [
					str.slice(0, i),
					str.slice(i, j),
					str.slice(j, k),
					str.slice(k)
				];

				let isValid = true;
				ip.forEach(seg => {
					isValid = isValid && isValidIpSegment(seg);
				});

				if (isValid) ips.push(ip.join('.'));
			}
		}
	}
	return ips;
}

/**
 *
 * @param {string[]} segment
 * @returns {boolean}
 */
function isValidIpSegment(segment) {
	return !((segment[0] === '0' && segment !== '0') || segment > 255);
}

/**
 *
 * @param {number[][]} array
 * @returns {number[][]}
 */
function mergeOverlappingIntervals(array) {
	array.sort((a, b) => a[0] - b[0]);

	const intervals = [array[0].slice()];
	for (let interval of array) {
		let [x1, y1] = interval;
		let [, y2] = intervals[intervals.length - 1];

		if (y2 >= x1) intervals[intervals.length - 1][1] = Math.max(y1, y2);
		else intervals.push(interval.slice());
	}
	return intervals;
}

/**
 *
 * @param {number[]} array
 * @returns {number}
 */
function arrayJumpingGame(array) {
	const reachable = jumps(array);
	return reachable.includes(Infinity) ? 0 : 1;
}

/**
 *
 * @param {number[]} array
 * @returns {number}
 */
function arrayJumpingGameII(array) {
	const reachable = jumps(array);
	return reachable[reachable.length - 1] === Infinity ? 0 : reachable[reachable.length - 1];
}

/**
 *
 * @param {number[]} array
 * @returns {number[]}
 */
function jumps(array) {
	const reachable = new Array(array.length).fill(Infinity);
	reachable[0] = 0;
	for (let i = 0; i < array.length; i++) {
		let num = array[i];
		for (let j = 1; j <= num; j++) {
			if (i + j === array.length) break;
			reachable[i + j] = Math.min(reachable[i + j], reachable[i] + 1);
		}
	}
	return reachable;
}

/**
 *
 * @param {number} n
 * @returns {number}
 */
function totalWaysToSum(n) {
	const table = [1];
	table.length = n + 1;
	table.fill(0, 1);
	for (let i = 1; i < n; i++) {
		for (let j = i; j <= n; j++) {
			table[j] += table[j - i];
		}
	}
	return table[n];
}

/**
 *
 * @param {[number, number[]]} data
 * @returns {number}
 */
function totalWaysToSumII(data) {
	const [n, digits] = data;
	const table = [1];
	table.length = n + 1;
	table.fill(0, 1);
	for (const i of digits) {
		for (let j = i; j <= n; j++) {
			table[j] += table[j - i];
		}
	}
	return table[n];
}

/**
 *
 * @param {[string, number]} data
 * @returns {string[]}
 */
function validMathExpressions(data) {
	const [digits, target] = data;

	const result = [];
	if (digits == null || digits.length === 0) return result;
	recursiveExpression(result, '', digits, target, 0, 0, 0);

	return result;
}

/**
 *
 * @param {string[]} res
 * @param {string} path
 * @param {string} digits
 * @param {number} target
 * @param {number} pos
 * @param {number} evaluated
 * @param {number} multed
 */
function recursiveExpression(res, path, digits, target, pos, evaluated, multed) {
	if (pos === digits.length) {
		if (target === evaluated) res.push(path);
		return;
	}
	for (let i = pos; i < digits.length; i++) {
		if (i !== pos && digits[pos] === '0') break;
		const cur = parseInt(digits.substring(pos, i + 1));
		if (pos === 0) recursiveExpression(res, path + cur, digits, target, i + 1, cur, cur);
		else {
			recursiveExpression(res, path + '+' + cur, digits, target, i + 1, evaluated + cur, cur);
			recursiveExpression(res, path + '-' + cur, digits, target, i + 1, evaluated - cur, -cur);
			recursiveExpression(res, path + '*' + cur, digits, target, i + 1, evaluated - multed + multed * cur, multed * cur);
		}
	}
}

/**
 *
 * @param {string} data
 * @returns {string[]}
 */
function sanitizeParentheses(data) {
	const valid = new Set('');
	let min = data.length;
	for (let i = 0; i < 2 ** data.length; i++) {
		let j = i.toString(2);
		while (j.length < data.length) {
			j = '0' + j;
		}

		let str = '';
		let deletions = 0;
		for (let k = 0; k < j.length; k++) {
			if (j[k] === '1' || (data[k] !== '(' && data[k] !== ')')) str += data[k];
			else deletions++;
		}
		if (deletions > min) continue;

		let count = 0;
		let neg = false;
		for (let k of str) {
			if (k === '(') count++;
			else if (k === ')') count--;
			if (count < 0) neg = true;
		}
		if (count > 0 || neg) continue;

		if (deletions === min) valid.add(str);
		else if (deletions < min) {
			min = deletions;
			valid.clear();
			valid.add(str);
		}
	}
	return [...valid];
}

/**
 *
 * @param {number} n
 * @returns {string}
 */
function hammingEncode(n) {
	const array = Array.from(n.toString(2));
	const encodedArray = [];
	let i = 0;
	while (array.length > 0) {
		if ((i & (i - 1)) !== 0) encodedArray[i] = array.shift();
		i++;
	}
	const p = Math.ceil(Math.log2(encodedArray.length));
	for (i = 0; i < p; i++) encodedArray[2 ** i] = (encodedArray.filter((b, k) => b === '1' &&
		(k.toString(2).padStart(p, '0'))[p - i - 1] === '1').length % 2).toString();
	encodedArray[0] = (encodedArray.filter(b => b === '1').length % 2).toString();
	return encodedArray.join('');
}

/**
 *
 * @param {string} bitstring
 * @returns {string}
 */
function hammingDecode(bitstring) {
	const array = Array.from(bitstring);
	const error = array.reduce((a, b, i) => b === '1' ? a ^ i : a, 0);
	if (error) array[error] = array[error] === '1' ? '0' : '1';
	const decodedArray = [];
	for (const [i, b] of array.entries()) {
		if ((i & (i - 1)) === 0) continue;
		decodedArray.push(b);
	}
	return parseInt(decodedArray.join(''), 2).toString();
}

/**
 *
 * @param {array} data
 * @returns {number[]}
 */
function twoColoring(data) {
	// Set up array to hold colors
	const coloring = Array(data[0]).fill(undefined);
	// Keep looping on undefined vertices if graph is disconnected
	while (coloring.some(e => e === undefined)) {
		// Color a vertex in the graph
		const initialVertex = coloring.findIndex(e => e === undefined);
		coloring[initialVertex] = 0;
		const frontier = [initialVertex];
		// Propagate the coloring throughout the component containing v greedily
		while (frontier.length > 0) {
			const v = frontier.pop();
			for (const u of neighbourhood(data, v)) {
				if (coloring[u] === undefined) {
					coloring[u] = coloring[v] ^ 1; // Set the color of u to the opposite of the color of v
					frontier.push(u); // Check u next
				}
				// Assert that u and v do not have the same color if they are already colored
				else if (coloring[u] === coloring[v]) return '[]';
			}
		}
	}
	return coloring;
}

/**
 *
 * @param {array} data
 * @param {number} vertex
 * @returns {number[]}
 */
function neighbourhood(data, vertex) {
	const adjLeft = data[1].filter(([a, _]) => a === vertex).map(([_, b]) => b);
	const adjRight = data[1].filter(([_, b]) => b === vertex).map(([a, _]) => a);
	return adjLeft.concat(adjRight);
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
function runLengthEncoding(str) {
	const encoding = [];
	let count, previous, i;
	for (count = 1, previous = str[0], i = 1; i < str.length; i++) {
		if (str[i] !== previous || count === 9) {
			encoding.push(count, previous);
			count = 1;
			previous = str[i];
		} else count++;
	}
	encoding.push(count, previous);
	return encoding.join('');
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
function decompressLZ(str) {
	let decoded = '', type = 0, len, ref, pos, i = 0, j;
	while (i < str.length) {
		if (i > 0) type ^= 1;
		len = parseInt(str[i]);
		ref = parseInt(str[++i]);
		if (len === 0) continue;
		if (!isNaN(ref) && type === 1) {
			i++;
			for (j = 0; j < len; j++) decoded += decoded[decoded.length - ref];
		} else {
			pos = i;
			for (; i < len + pos; i++) decoded += str[i];
		}
	}
	return decoded;
}

/**
 *
 * @param {str} str
 * @returns {string}
 */
function compressLZ(str) {
	// state [i][j] contains a backreference of offset i and length j
	let cur_state = Array.from(Array(10), _ => Array(10)), new_state, tmp_state, result;
	cur_state[0][1] = ''; // initial state is a literal of length 1
	for (let i = 1; i < str.length; i++) {
		new_state = Array.from(Array(10), _ => Array(10));
		const c = str[i];
		// handle literals
		for (let len = 1; len <= 9; len++) {
			const input = cur_state[0][len];
			if (input === undefined) continue;
			if (len < 9) set(new_state, 0, len + 1, input); // extend current literal
			else set(new_state, 0, 1, input + '9' + str.substring(i - 9, i) + '0'); // start new literal
			for (let offset = 1; offset <= Math.min(9, i); offset++) { // start new backreference
				if (str[i - offset] === c) set(new_state, offset, 1, input + len + str.substring(i - len, i));
			}
		}
		// handle backreferences
		for (let offset = 1; offset <= 9; offset++) {
			for (let len = 1; len <= 9; len++) {
				const input = cur_state[offset][len];
				if (input === undefined) continue;
				if (str[i - offset] === c) {
					if (len < 9) set(new_state, offset, len + 1, input); // extend current backreference
					else set(new_state, offset, 1, input + '9' + offset + '0'); // start new backreference
				}
				set(new_state, 0, 1, input + len + offset); // start new literal
				// end current backreference and start new backreference
				for (let new_offset = 1; new_offset <= Math.min(9, i); new_offset++) {
					if (str[i - new_offset] === c) set(new_state, new_offset, 1, input + len + offset + '0');
				}
			}
		}
		tmp_state = new_state;
		new_state = cur_state;
		cur_state = tmp_state;
	}
	for (let len = 1; len <= 9; len++) {
		let input = cur_state[0][len];
		if (input === undefined) continue;
		input += len + str.substring(str.length - len, str.length);
		// noinspection JSUnusedAssignment
		if (result === undefined || input.length < result.length) result = input;
	}
	for (let offset = 1; offset <= 9; offset++) {
		for (let len = 1; len <= 9; len++) {
			let input = cur_state[offset][len];
			if (input === undefined) continue;
			input += len + '' + offset;
			if (result === undefined || input.length < result.length) result = input;
		}
	}
	return result ?? '';
}

/**
 *
 * @param {string[][]} state
 * @param {number} i
 * @param {number} j
 * @param {string} str
 */
function set(state, i, j, str) {
	if (state[i][j] === undefined || str.length < state[i][j].length) state[i][j] = str;
}

/**
 *
 * @param {[string, number]} data
 * @returns {string}
 */
function caesar(data) {
	const [str, k] = data;
	let result = '';
	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i);
		if (charCode === 32) result += ' ';
		else result += String.fromCharCode((charCode - 65 + (26 - k)) % 26 + 65);
	}
	return result;
}

/**
 *
 * @param {[string, string]} data
 * @returns {string}
 */
function vigenere(data) {
	const [str, key] = data;
	let result = '';
	for (let i = 0; i < str.length; i++) {
		const charCode = str.charCodeAt(i) - 65;
		const keyCode = key.charCodeAt(i % key.length) - 65;
		result += String.fromCharCode((charCode + keyCode) % 26 + 65);
	}
	return result;
}