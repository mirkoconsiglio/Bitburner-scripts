import {getServers, printBoth} from '/utils/utils.js';

export function contractor(ns) {
	for (let server of getServers(ns)) {
		let files = ns.ls(server, '.cct');
		for (let file of files) {
			let contract = ns.codingcontract.getContractType(file, server);
			let data = ns.codingcontract.getData(file, server);
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
				case 'Total Ways to Sum':
					solution = totalWaysToSum(data);
					break;
				case 'Find All Valid Math Expressions':
					solution = validMathExpressions(data);
					break;
				case 'Sanitize Parentheses in Expression':
					solution = sanitizeParentheses(data);
					break;
				default:
					printBoth(ns, `Found ${file} on ${server} of type: ${contract}.`)
			}
			let result = ns.codingcontract.attempt(solution, file, server, {returnReward: true});
			if (result) {
				printBoth(ns, `Solved ${file} on ${server} of type: ${contract}. ${result}.`);
			} else {
				printBoth(ns, `Could not solve ${file} on ${server} of type: ${contract}.`);
				printBoth(ns, `Disabling contractor.`);
				return false;
			}
		}
	}
	return true;
}

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
			for (col; col <= maxcol; col++) {
				list.push(matrix[row][col]);
			}
			minrow++;
			row++;
			col--;
		}
		if (maxcol >= mincol) {
			for (row; row <= maxrow; row++) {
				list.push(matrix[row][col]);
			}
			maxcol--;
			col--;
			row--;
		}
		if (minrow <= maxrow) {
			for (col; col >= mincol; col--) {
				list.push(matrix[row][col]);
			}
			maxrow--;
			col++;
			row--;
		}
		if (mincol <= maxcol) {
			for (row; row >= minrow; row--) {
				list.push(matrix[row][col]);
			}
			mincol++;
			row++;
			col++;
		}
	}
	return list;
}

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

function uniquePathsI(data) {
	const [m, n] = data;

	const f = [];
	const x = factorial(f, m + n - 2);
	const y = factorial(f, m - 1);
	const z = factorial(f, n - 1);

	return x / (y * z);
}

function factorial(f, n) {
	if (n === 0 || n === 1) return 1;
	if (f[n] > 0) return f[n];
	return f[n] = n * factorial(f, n - 1);
}

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

function genIPAddresses(string) {
	const ips = [];
	for (let i = 1; i < string.length - 2; i++) {
		for (let j = i + 1; j < string.length - 1; j++) {
			for (let k = j + 1; k < string.length; k++) {
				const ip = [
					string.slice(0, i),
					string.slice(i, j),
					string.slice(j, k),
					string.slice(k)
				];

				let isValid = true;
				ip.forEach(seg => {
					isValid = isValid && isValidIpSegment(seg)
				});

				if (isValid) ips.push(ip.join('.'));
			}
		}
	}
	return ips;
}

function isValidIpSegment(segment) {
	return !((segment[0] === '0' && segment !== '0') || segment > 255);
}

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

function arrayJumpingGame(array) {
	const reachable = new Array(array.length).fill(0);
	reachable[0] = 1;
	for (let i = 0; i < array.length; i++) {
		let num = array[i];
		for (let j = 1; j <= num; j++) {
			if (i + j === array.length) break;
			reachable[i + j] = 1;
		}
	}
	return reachable.includes(0) ? 0 : 1;
}

function totalWaysToSum(n) {
	const table = [1];
	for (let i = 0; i < n; i++) {
		table.push(0);
	}
	for (let i = 1; i < n; i++) {
		for (let j = i; j <= n; j++) {
			table[j] += table[j - i];
		}
	}
	return table[n];
}

function validMathExpressions(data) {
	const [digits, target] = data;
	const valid = [];
	for (let i = 0; i < 4 ** (digits.length - 1); i++) {
		let j = i.toString(4);
		while (j.length < digits.length - 1) {
			j = '0' + j;
		}
		if (digits[0] === '0' && j[0] === '0') continue;

		let expr = digits[0];
		for (let k = 1; k < digits.length; k++) {
			if (digits[k] === '0' && j[k] === '0' && j[k - 1] !== '0') break;

			let op;
			switch (j[k - 1]) {
				case '0':
					op = '';
					break;
				case '1':
					op = '+';
					break;
				case '2':
					op = '-';
					break;
				case '3':
					op = '*';
					break;
			}
			expr += op + digits[k];
		}
		if (eval(expr) === target) valid.push(expr);
	}
	return valid;
}

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