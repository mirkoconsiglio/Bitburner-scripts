import {backdoor} from 'utils.js';

export async function main(ns) {
	await backdoor(ns, ns.args[0]);
}

export function autocomplete(data) {
	return data.servers;
}