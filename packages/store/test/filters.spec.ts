import { test, expect } from "vite-plus/test";
import { isMultiDay } from "../src/models/helpers/filters";
import type { CalendarEvent } from "../src/types";

function makeEvent(start: string, end: string): CalendarEvent {
	return { id: 1, start: new Date(start), end: new Date(end) };
}

test("same day event is not multi-day", () => {
	const ev = makeEvent("2025-10-28T10:00", "2025-10-28T11:00");
	expect(isMultiDay(ev)).toBe(false);
});

test("event spanning two days is multi-day", () => {
	const ev = makeEvent("2025-10-28T10:00", "2025-10-29T10:00");
	expect(isMultiDay(ev)).toBe(true);
});

test("event spanning months is multi-day", () => {
	const ev = makeEvent("2025-10-31T10:00", "2025-11-01T10:00");
	expect(isMultiDay(ev)).toBe(true);
});

test("event spanning years is multi-day", () => {
	const ev = makeEvent("2025-12-31T23:00", "2026-01-01T01:00");
	expect(isMultiDay(ev)).toBe(true);
});

test("event ending at midnight next day is multi-day", () => {
	const ev = makeEvent("2025-10-28T22:00", "2025-10-29T00:00");
	expect(isMultiDay(ev)).toBe(true);
});

test("event starting and ending at midnight same day is not multi-day", () => {
	const ev = makeEvent("2025-10-28T00:00", "2025-10-28T23:59");
	expect(isMultiDay(ev)).toBe(false);
});

test("same-day event with allDay flag is multi-day", () => {
	const ev = {
		...makeEvent("2025-10-28T09:00", "2025-10-28T17:00"),
		allDay: true,
	};
	expect(isMultiDay(ev)).toBe(true);
});

test("allDay false does not affect normal multi-day detection", () => {
	const ev = {
		...makeEvent("2025-10-28T10:00", "2025-10-29T10:00"),
		allDay: false,
	};
	expect(isMultiDay(ev)).toBe(true);
});

test("allDay false same-day event is not multi-day", () => {
	const ev = {
		...makeEvent("2025-10-28T10:00", "2025-10-28T11:00"),
		allDay: false,
	};
	expect(isMultiDay(ev)).toBe(false);
});
