import {getFragment} from '/stanek/utils.js';

export async function main(ns) {
	ns.tprintf(JSON.stringify(ns.stanek.activeFragments().map(f => ({
		rootX: f.x,
		rootY: f.y,
		rotation: f.rotation,
		fragmentID: f.id,
		type: getFragment(ns, f.id).type
	}))));
}