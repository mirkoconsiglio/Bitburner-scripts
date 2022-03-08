import {NS} from 'types/index.js';
import {getPorts} from 'utils/utils.js';

export async function main(ns: NS) {
	const args = ns.flags([
		['pattern', 'starter'],
		['maxCharges', 100],
		['host', 'home'],
		['reservedRam', 0]
	]);
	const port = ns.getPortHandle(getPorts().stanek);
	const data = [args.pattern, args.maxCharges, args.host, args.reservedRam];
	port.tryWrite(data);
}