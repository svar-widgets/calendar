import { test, expect } from "vite-plus/test";
import {
	createScale,
	LinearScale,
	DiscreteScale,
} from "../src/models/helpers/scales";
import type { CalendarEvent } from "../src/types";

test("LinearScale from date config - 7 day week", () => {
	const scale = createScale(
		{ type: "date", length: 7 },
		new Date("2025-10-27")
	);
	expect(scale.count).toBe(7);
	expect(scale.units).toHaveLength(7);
	expect(scale.units[0].position).toBeCloseTo(0);
	expect(scale.units[0].size).toBeCloseTo(100 / 7);
	expect(scale.units[1].position).toBeCloseTo(100 / 7);
	expect(scale.units[6].position).toBeCloseTo((6 * 100) / 7);
});

test("LinearScale eventToPosition for date scale", () => {
	const scale = createScale(
		{ type: "date", length: 7 },
		new Date("2025-10-27")
	);
	// Wednesday 10am: 2 days + 10/24 day
	const pos = scale.eventToPosition({
		start: new Date("2025-10-29T10:00"),
		end: new Date("2025-10-29T18:00"),
	} as CalendarEvent);
	// 2 days + 10h out of 7 days = (2 + 10/24)/7 * 100
	expect(pos.start).toBeCloseTo(((2 + 10 / 24) / 7) * 100, 1);
	expect(pos.end).toBeCloseTo(((2 + 18 / 24) / 7) * 100, 1);
});

test("LinearScale contains", () => {
	const scale = createScale(
		{ type: "date", length: 7 },
		new Date("2025-10-27")
	);
	expect(scale.contains(new Date("2025-10-29"))).toBe(true);
	expect(scale.contains(new Date("2025-11-05"))).toBe(false);
	// rangeEnd is exclusive
	expect(scale.contains(new Date("2025-11-03T00:00"))).toBe(false);
});

test("LinearScale positionToValue", () => {
	const scale = createScale(
		{ type: "date", length: 7 },
		new Date("2025-10-27")
	);
	const mid = scale.positionToValue(50) as Date;
	// Midpoint of 7 days from Oct 27 = Oct 30 12:00
	expect(mid.getDate()).toBe(30);
	expect(mid.getHours()).toBe(12);
});

test("LinearScale from time config - 10 hour day", () => {
	const scale = createScale(
		{ type: "time", startHour: 8, endHour: 18, step: 60 },
		new Date("2025-10-27")
	);
	expect(scale.count).toBe(10);
	expect(scale.units[0].position).toBe(0);
	expect(scale.units[0].size).toBe(10);
});

test("LinearScale time positions at 10% and 25% for 9:00-10:30", () => {
	const scale = createScale(
		{ type: "time", startHour: 8, endHour: 18, step: 60 },
		new Date("2025-10-27")
	);
	const pos = scale.eventToPosition({
		start: new Date("2025-10-27T09:00"),
		end: new Date("2025-10-27T10:30"),
	} as CalendarEvent);
	expect(pos.start).toBeCloseTo(10);
	expect(pos.end).toBeCloseTo(25);
});

test("DiscreteScale with 3 items", () => {
	const scale = createScale(
		{
			type: "unit",
			items: [
				{ id: "room-a", label: "Room A" },
				{ id: "room-b", label: "Room B" },
				{ id: "room-c", label: "Room C" },
			],
			accessor: "roomId",
		},
		new Date()
	);
	expect(scale.count).toBe(3);
	expect(scale.units[0].size).toBeCloseTo(100 / 3);
	expect(scale.units[1].position).toBeCloseTo(100 / 3);
	expect(scale.units[2].position).toBeCloseTo(200 / 3);
});

test("DiscreteScale eventToPosition", () => {
	const scale = createScale(
		{
			type: "unit",
			items: [
				{ id: "room-a", label: "Room A" },
				{ id: "room-b", label: "Room B" },
				{ id: "room-c", label: "Room C" },
			],
			accessor: "roomId",
		},
		new Date()
	);
	const pos = scale.eventToPosition({
		roomId: "room-b",
		start: new Date(),
		end: new Date(),
	} as any);
	expect(pos.start).toBeCloseTo(100 / 3);
	expect(pos.end).toBeCloseTo(200 / 3);
});

test("DiscreteScale positionToValue", () => {
	const scale = createScale(
		{
			type: "unit",
			items: [
				{ id: "room-a", label: "Room A" },
				{ id: "room-b", label: "Room B" },
				{ id: "room-c", label: "Room C" },
			],
			accessor: "roomId",
		},
		new Date()
	);
	expect(scale.positionToValue(0)).toBe("room-a");
	expect(scale.positionToValue(50)).toBe("room-b");
	expect(scale.positionToValue(100)).toBe("room-c");
});

test("DiscreteScale contains always true", () => {
	const scale = createScale(
		{
			type: "unit",
			items: [{ id: "a", label: "A" }],
			accessor: "x",
		},
		new Date()
	);
	expect(scale.contains(new Date())).toBe(true);
});

test("createScale factory routes correctly", () => {
	const dateScale = createScale(
		{ type: "date", length: 5 },
		new Date("2025-10-27")
	);
	expect(dateScale).toBeInstanceOf(LinearScale);

	const timeScale = createScale(
		{ type: "time", startHour: 9, endHour: 17, step: 60 },
		new Date("2025-10-27")
	);
	expect(timeScale).toBeInstanceOf(LinearScale);

	const unitScale = createScale(
		{
			type: "unit",
			items: [{ id: 1, label: "X" }],
			accessor: "x",
		},
		new Date()
	);
	expect(unitScale).toBeInstanceOf(DiscreteScale);
});

test("LinearScale getHeaders returns single level", () => {
	const scale = createScale(
		{ type: "date", length: 3 },
		new Date("2025-10-27")
	);
	const headers = scale.getHeaders();
	expect(headers).toHaveLength(1);
	expect(headers[0]).toHaveLength(3);
});
