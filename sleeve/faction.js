import {disableSleeveAutopilot} from '/sleeve/utils.js';
import {getFactions} from '/utils.js';

const argsSchema = [
	['sleeve', undefined],
	['faction', undefined],
	['hacking', false],
	['field', false],
	['security', false]
];

// noinspection JSUnusedLocalSymbols
export function autocomplete(data, options) {
	data.flags(argsSchema);
	return [...getFactions()];
}

/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
	const options = ns.flags(argsSchema);
	// Get sleeve number
	if (!options.sleeve) throw new Error(`Need to specify --sleeve 'number'`);
	const sleeveNumber = options.sleeve;
	// Get faction
	if (!options.faction) throw new Error(`Need to specify --faction 'faction'`);
	const faction = options.faction;
	// Get work type
	if (!options.hacking && !options.field && !options.security)
		throw new Error(`Specify --hacking, --field or --security for work type`);
	const workType = options.hacking ? 'Hacking Contracts' : options.field ? 'Field Work' : 'Security Work';
	// Get factions player has joined
	const foundFaction = ns.getPlayer().factions.find(f => f.toLowerCase() === faction.toLowerCase());
	if (!foundFaction) throw new Error(`Invalid faction or you haven't joined ${faction} yet`);
	// Disable autopilot for this sleeve
	await disableSleeveAutopilot(ns, sleeveNumber);
	// Set sleeve to faction work
	if (!ns.sleeve.setToFactionWork(sleeveNumber, foundFaction, workType))
		throw new Error(`Could not get sleeve ${sleeveNumber} to start working for ${foundFaction} doing ${workType}`);
}