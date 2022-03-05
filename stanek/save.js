export async function main(ns) {
	ns.tprint(JSON.stringify(ns.stanek.activeFragments().map(f => ({
		rootX: f.x,
		rootY: f.y,
		rotation: f.rotation,
		fragmentId: f.id,
		type: f.type
	}))));
}