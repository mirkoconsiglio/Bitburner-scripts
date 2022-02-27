import {getPorts} from '/utils/utils.js';

export function getWorks() {
	return ['security', 'field', 'hacking'];
}

export function enableSleeveAutopilot(ns, sleeveNumber) {
	const port = ns.getPortHandle(getPorts().sleeve);
	const data = port.empty() ? defineAutopilotData(ns) : port.read();
	data[sleeveNumber] = true;
	port.tryWrite(data);
}

export function disableSleeveAutopilot(ns, sleeveNumber) {
	const port = ns.getPortHandle(getPorts().sleeve);
	const data = port.empty() ? defineAutopilotData(ns) : port.read();
	data[sleeveNumber] = false;
	port.tryWrite(data);
}

export function getAutopilotData(ns) {
	const port = ns.getPortHandle(getPorts().sleeve);
	return port.empty() ? defineAutopilotData(ns) : port.read();
}

export function defineAutopilotData(ns) {
	return Array.from({length: ns.sleeve.getNumSleeves()}, _ => true);
}