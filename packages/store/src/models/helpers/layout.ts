import type { Primitive } from "../../types";

export interface BarLayoutResult {
	primitives: Primitive[];
	totalLanes: number;
}

export interface BoxLayoutResult {
	primitives: Primitive[];
}

export function layoutBars(primitives: Primitive[]): BarLayoutResult {
	const valid = primitives.filter(p => p.width > 0);
	if (valid.length === 0) return { primitives: [], totalLanes: 0 };

	const lanes: number[] = [];
	const result: Primitive[] = [];

	for (const p of valid) {
		let assigned = -1;
		for (let i = 0; i < lanes.length; i++) {
			// epsilon: positions computed as index*(100/N) accumulate fp drift
			if (lanes[i] <= p.x + 1e-9) {
				assigned = i;
				break;
			}
		}
		if (assigned === -1) {
			assigned = lanes.length;
			lanes.push(0);
		}
		lanes[assigned] = p.x + p.width;
		result.push({ ...p, lane: assigned, totalLanes: 0 });
	}

	const totalLanes = lanes.length;
	for (const p of result) {
		p.totalLanes = totalLanes;
	}

	return { primitives: result, totalLanes };
}

export function layoutBoxes(primitives: Primitive[]): BoxLayoutResult {
	const valid = primitives.filter(p => p.height > 0);
	if (valid.length === 0) return { primitives: [] };

	// Form conflict groups by transitive y-overlap
	const groups: Primitive[][] = [];
	let currentGroup: Primitive[] = [];
	let groupEnd = -Infinity;

	for (const p of valid) {
		if (currentGroup.length === 0 || p.y < groupEnd) {
			currentGroup.push(p);
			groupEnd = Math.max(groupEnd, p.y + p.height);
		} else {
			groups.push(currentGroup);
			currentGroup = [p];
			groupEnd = p.y + p.height;
		}
	}
	if (currentGroup.length > 0) groups.push(currentGroup);

	const result: Primitive[] = [];

	for (const group of groups) {
		// Greedy slot assignment; slots.length after the loop equals max concurrency
		const slots: number[] = [];
		for (const p of group) {
			let assigned = -1;
			for (let i = 0; i < slots.length; i++) {
				if (slots[i] <= p.y) {
					assigned = i;
					break;
				}
			}
			if (assigned === -1) {
				assigned = slots.length;
				slots.push(0);
			}
			slots[assigned] = p.y + p.height;
			result.push({ ...p, slot: assigned, maxConcurrency: 0 });
		}

		const maxConcurrency = slots.length;
		for (let i = result.length - group.length; i < result.length; i++) {
			result[i].maxConcurrency = maxConcurrency;
		}
	}

	return { primitives: result };
}
