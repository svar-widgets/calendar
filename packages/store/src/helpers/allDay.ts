import type { CalendarEvent } from "../types";

function startOfLocalDay(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function nextLocalDay(date: Date): Date {
	const d = startOfLocalDay(date);
	d.setDate(d.getDate() + 1);
	return d;
}

function isLocalMidnight(date: Date): boolean {
	return (
		date.getHours() === 0 &&
		date.getMinutes() === 0 &&
		date.getSeconds() === 0 &&
		date.getMilliseconds() === 0
	);
}

function isSameLocalDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

function normalizeAllDayEnd(start: Date, end?: Date): Date {
	const startDay = startOfLocalDay(start);
	if (!(end instanceof Date)) return nextLocalDay(startDay);
	if (end <= startDay || isSameLocalDay(startDay, end)) {
		return nextLocalDay(startDay);
	}
	if (isLocalMidnight(end)) return new Date(end);
	return nextLocalDay(end);
}

export function normalizeAllDayEvent<T extends Partial<CalendarEvent>>(
	event: T
): T {
	if (event.allDay !== true || !(event.start instanceof Date)) {
		return event;
	}

	const start = startOfLocalDay(event.start);
	const end = normalizeAllDayEnd(start, event.end);
	return { ...event, start, end };
}

export function normalizeAllDayUpdate(
	updates: Partial<CalendarEvent>,
	existing?: CalendarEvent
): Partial<CalendarEvent> {
	const merged = existing ? { ...existing, ...updates } : updates;
	if (merged.allDay !== true || !(merged.start instanceof Date)) {
		return updates;
	}

	const normalized = normalizeAllDayEvent(merged);
	return {
		...updates,
		start: normalized.start,
		end: normalized.end,
	};
}
