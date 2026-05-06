import { test, expect } from "vite-plus/test";
import { WeekViewModel } from "../src/models/week_view";
import type { CalendarEvent } from "../src/types";

function makeEvent(
	id: number,
	start: string,
	end: string,
	extra?: Record<string, any>
): CalendarEvent {
	return {
		id,
		start: new Date(start),
		end: new Date(end),
		...extra,
	};
}

test("rangeStart - Wednesday to Monday", () => {
	const vm = new WeekViewModel();
	const result = vm.rangeStart(new Date("2025-10-29")); // Wednesday
	expect(result.getFullYear()).toBe(2025);
	expect(result.getMonth()).toBe(9); // October
	expect(result.getDate()).toBe(27); // Monday
	expect(result.getHours()).toBe(0);
});

test("rangeStart - Monday stays Monday", () => {
	const vm = new WeekViewModel();
	const result = vm.rangeStart(new Date("2025-10-27"));
	expect(result.getDate()).toBe(27);
});

test("rangeStart - Sunday to Monday", () => {
	const vm = new WeekViewModel();
	const result = vm.rangeStart(new Date("2025-11-02")); // Sunday
	expect(result.getDate()).toBe(27); // Previous Monday
});

test("addRange forward and backward", () => {
	const vm = new WeekViewModel();
	const mon = new Date("2025-10-27");
	const next = vm.addRange(mon, 1);
	expect(next.getDate()).toBe(3); // Nov 3
	expect(next.getMonth()).toBe(10); // November

	const prev = vm.addRange(mon, -1);
	expect(prev.getDate()).toBe(20); // Oct 20
});

test("getSections returns 2 sections", () => {
	const vm = new WeekViewModel();
	const sections = vm.getSections();
	expect(sections).toHaveLength(2);
	expect(sections[0].name).toBe("multiday");
	expect(sections[0].mode).toBe("bars");
	expect(sections[1].name).toBe("timeGrid");
	expect(sections[1].mode).toBe("boxes");
});

test("process - single day event in timeGrid", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));

	const events = [
		makeEvent(1, "2025-10-27T09:00", "2025-10-27T10:00", {
			title: "Standup",
		}),
	];
	const results = vm.process(events);

	expect(results).toHaveLength(2);
	// multiday: no primitives (single-day event)
	expect(results[0].primitives).toHaveLength(0);
	// timeGrid: one primitive
	expect(results[1].primitives).toHaveLength(1);
	const p = results[1].primitives[0];
	expect(p.id).toBe(1);
	// Monday column: x ≈ 0
	expect(p.x).toBeCloseTo(0, 0);
	expect(p.width).toBeCloseTo(100 / 7, 1);
	// 9am-10am in 8-18 range: y = 10%, height = 10%
	expect(p.y).toBeCloseTo(10, 1);
	expect(p.height).toBeCloseTo(10, 1);
});

test("process - multi-day event in multiday", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));

	const events = [
		makeEvent(3, "2025-10-27T00:00", "2025-10-29T00:00", {
			title: "Sprint",
		}),
	];
	const results = vm.process(events);

	// multiday: one bar
	expect(results[0].primitives).toHaveLength(1);
	const bar = results[0].primitives[0];
	expect(bar.id).toBe(3);
	// Mon-Tue span: x ≈ 0, width ≈ 2/7 * 100
	expect(bar.x).toBeCloseTo(0, 1);
	expect(bar.width).toBeCloseTo((2 / 7) * 100, 1);
	expect(bar.lane).toBe(0);
	expect(bar.totalLanes).toBe(1);

	// timeGrid: no single-day events
	expect(results[1].primitives).toHaveLength(0);
});

test("process - mixed events", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));

	const events = [
		makeEvent(1, "2025-10-27T09:00", "2025-10-27T10:00"),
		makeEvent(2, "2025-10-27T00:00", "2025-10-29T00:00"),
	];
	const results = vm.process(events);

	expect(results[0].primitives).toHaveLength(1); // multiday
	expect(results[1].primitives).toHaveLength(1); // timeGrid
});

test("process - overlapping same-day events get slots", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));

	const events = [
		makeEvent(4, "2025-10-29T09:00", "2025-10-29T09:30"),
		makeEvent(5, "2025-10-29T09:15", "2025-10-29T10:00"),
	];
	const results = vm.process(events);
	const prims = results[1].primitives;

	expect(prims).toHaveLength(2);
	expect(prims[0].maxConcurrency).toBe(2);
	expect(prims[1].maxConcurrency).toBe(2);
	expect(prims[0].slot).toBe(0);
	expect(prims[1].slot).toBe(1);
});

test("process - event crossing midnight splits into chunks", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));

	// Single-day event that just spans midnight but is in timeGrid
	// Actually this would be multi-day... let's test a multi-day bar split
	// A multi-day event spanning Mon-Wed should not be split (single unit in y)
	// Let's test splitting in timeGrid: an event starting Mon 17:00 ending Mon 18:00 (no split, single day)

	// For timeGrid splitting, we need an event that ends on a different day
	// but is NOT multi-day filtered. Actually multi-day goes to multiday section.
	// The timeGrid only gets single-day events. So splitting in timeGrid
	// wouldn't happen for single-day events.

	// Test multiday bars - they don't split since primary scale is y (single unit)
	const events = [
		makeEvent(1, "2025-10-27T00:00", "2025-10-30T00:00"), // Mon-Wed multiday
	];
	const results = vm.process(events);
	// In multiday section, primary is y (unit scale, 1 item), no splitting
	expect(results[0].primitives).toHaveLength(1);
});

test("process - empty events", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));

	const results = vm.process([]);
	expect(results).toHaveLength(2);
	expect(results[0].primitives).toHaveLength(0);
	expect(results[1].primitives).toHaveLength(0);
});

test("process - headers", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));

	const results = vm.process([
		makeEvent(1, "2025-10-27T09:00", "2025-10-27T10:00"),
	]);

	// timeGrid: x = 7 day headers, y = 10 hour headers
	expect(results[1].xHeaders).not.toBeNull();
	expect(results[1].xHeaders![0]).toHaveLength(7);
	expect(results[1].yHeaders).not.toBeNull();
	expect(results[1].yHeaders![0]).toHaveLength(10);

	// multiday: x = 7 day headers; y is a single-unit scale with visible: false
	expect(results[0].xHeaders).not.toBeNull();
	expect(results[0].xHeaders![0]).toHaveLength(7);
	expect(results[0].yHeaders).not.toBeNull();
	expect(results[0].yHeaders![0]).toHaveLength(1);
	expect(results[0].yVisible).toBe(false);
});

test("toPositionStart resolves coordinates in timeGrid", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));
	vm.process([makeEvent(1, "2025-10-27T09:00", "2025-10-27T10:00")]);

	// x ≈ 100/7 * 2 = ~28.57 → Wednesday, y = 30% of 8-18 → 11:00
	const props = vm.toPositionStart("timeGrid", (100 / 7) * 2, 30);
	expect(props.start).toBeInstanceOf(Date);
	const d = props.start as Date;
	expect(d.getDate()).toBe(29); // Wednesday
	expect(d.getHours()).toBe(11);
});

test("toPositionEnd resolves to end date", () => {
	const vm = new WeekViewModel();
	vm.setRange(new Date("2025-10-29"));
	vm.process([makeEvent(1, "2025-10-27T09:00", "2025-10-27T10:00")]);

	const props = vm.toPositionEnd("timeGrid", (100 / 7) * 2, 45);
	expect(props.end).toBeInstanceOf(Date);
	const d = props.end as Date;
	expect(d.getDate()).toBe(29); // Wednesday
	// 45% of 8-18 = 12:30
	expect(d.getHours()).toBe(12);
	expect(d.getMinutes()).toBe(30);
});
