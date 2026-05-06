import { test, expect } from "vite-plus/test";
import { layoutBars, layoutBoxes } from "../src/models/helpers/layout";
import type { Primitive, CalendarEvent } from "../src/types";

const ev = {} as CalendarEvent;

function bar(
	id: number,
	x: number,
	width: number,
	y = 0,
	height = 20
): Primitive {
	return { id, event: ev, x, y, width, height };
}

function box(
	id: number,
	y: number,
	height: number,
	x = 0,
	width = 100
): Primitive {
	return { id, event: ev, x, y, width, height };
}

test("layoutBars - no overlaps single lane", () => {
	const result = layoutBars([bar(1, 0, 14), bar(2, 28, 14)]);
	expect(result.totalLanes).toBe(1);
	expect(result.primitives[0].lane).toBe(0);
	expect(result.primitives[1].lane).toBe(0);
});

test("layoutBars - overlapping creates 2 lanes", () => {
	const result = layoutBars([bar(1, 0, 40), bar(2, 14, 28)]);
	expect(result.totalLanes).toBe(2);
	expect(result.primitives[0].lane).toBe(0);
	expect(result.primitives[1].lane).toBe(1);
});

test("layoutBars - first-fit reuse", () => {
	const result = layoutBars([bar(1, 0, 40), bar(2, 14, 28), bar(3, 57, 28)]);
	expect(result.totalLanes).toBe(2);
	expect(result.primitives[0].lane).toBe(0);
	expect(result.primitives[1].lane).toBe(1);
	expect(result.primitives[2].lane).toBe(0);
});

test("layoutBars - empty input", () => {
	const result = layoutBars([]);
	expect(result.totalLanes).toBe(0);
	expect(result.primitives).toHaveLength(0);
});

test("layoutBars - zero-width excluded", () => {
	const result = layoutBars([bar(1, 0, 0), bar(2, 10, 20)]);
	expect(result.primitives).toHaveLength(1);
	expect(result.primitives[0].id).toBe(2);
	expect(result.totalLanes).toBe(1);
});

test("layoutBars - totalLanes set on all primitives", () => {
	const result = layoutBars([bar(1, 0, 40), bar(2, 14, 28)]);
	for (const p of result.primitives) {
		expect(p.totalLanes).toBe(2);
	}
});

test("layoutBars - adjacent bars share lane despite floating point", () => {
	// Simulates month view: 7-day week, event on day 3 followed by event on day 4
	// Positions computed as index * (100/7), which can drift in floating point
	const day = 100 / 7;
	const result = layoutBars([bar(1, 2 * day, day), bar(2, 3 * day, 2 * day)]);
	expect(result.totalLanes).toBe(1);
	expect(result.primitives[0].lane).toBe(0);
	expect(result.primitives[1].lane).toBe(0);
});

test("layoutBoxes - no overlaps", () => {
	const result = layoutBoxes([box(1, 10, 15), box(2, 30, 15)]);
	expect(result.primitives).toHaveLength(2);
	expect(result.primitives[0].slot).toBe(0);
	expect(result.primitives[0].maxConcurrency).toBe(1);
	expect(result.primitives[1].slot).toBe(0);
	expect(result.primitives[1].maxConcurrency).toBe(1);
});

test("layoutBoxes - 2 overlapping", () => {
	const result = layoutBoxes([box(1, 10, 20), box(2, 20, 15)]);
	expect(result.primitives).toHaveLength(2);
	expect(result.primitives[0].slot).toBe(0);
	expect(result.primitives[0].maxConcurrency).toBe(2);
	expect(result.primitives[1].slot).toBe(1);
	expect(result.primitives[1].maxConcurrency).toBe(2);
});

test("layoutBoxes - transitive overlap", () => {
	const result = layoutBoxes([box(1, 0, 30), box(2, 20, 30), box(3, 40, 20)]);
	expect(result.primitives).toHaveLength(3);
	// All in one group, maxConcurrency = 2
	expect(result.primitives[0].maxConcurrency).toBe(2);
	expect(result.primitives[2].maxConcurrency).toBe(2);
	// C reuses slot 0 after A ends
	expect(result.primitives[0].slot).toBe(0);
	expect(result.primitives[1].slot).toBe(1);
	expect(result.primitives[2].slot).toBe(0);
});

test("layoutBoxes - separate groups", () => {
	const result = layoutBoxes([box(1, 0, 10), box(2, 5, 10), box(3, 50, 10)]);
	// Group 1: ids 1,2 overlapping; Group 2: id 3 alone
	expect(result.primitives[0].maxConcurrency).toBe(2);
	expect(result.primitives[1].maxConcurrency).toBe(2);
	expect(result.primitives[2].maxConcurrency).toBe(1);
});

test("layoutBoxes - empty input", () => {
	const result = layoutBoxes([]);
	expect(result.primitives).toHaveLength(0);
});

test("layoutBoxes - zero-height excluded", () => {
	const result = layoutBoxes([box(1, 10, 0), box(2, 20, 15)]);
	expect(result.primitives).toHaveLength(1);
	expect(result.primitives[0].id).toBe(2);
});
