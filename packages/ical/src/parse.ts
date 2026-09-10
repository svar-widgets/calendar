import type { CalendarEvent, EventID } from "./types";

interface Property {
	value: string;
	params: Record<string, string>;
}

type Properties = Record<string, Property[]>;

interface Entry {
	uid: string;
	recurrenceId?: Date;
	recurrenceKey?: string;
	event: CalendarEvent;
}

const DURATION_RE =
	/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/;

function unfold(ics: string): string {
	return ics.replace(/\r?\n[ \t]/g, "");
}

// Dates are read exactly as written: a TZID parameter is ignored and the
// value is taken in the calendar's own timezone, so a series, its EXDATEs
// and its RECURRENCE-IDs all land on the same wall clock.
function parseDate(value: string): { date: Date; allDay: boolean } {
	const y = +value.slice(0, 4);
	const mo = +value.slice(4, 6) - 1;
	const d = +value.slice(6, 8);
	// DATE-only: YYYYMMDD
	if (/^\d{8}$/.test(value)) {
		return { date: new Date(y, mo, d), allDay: true };
	}
	const h = +value.slice(9, 11);
	const mi = +value.slice(11, 13);
	const s = +value.slice(13, 15);
	// DATE-TIME UTC: YYYYMMDDTHHmmssZ
	if (value.endsWith("Z")) {
		return { date: new Date(Date.UTC(y, mo, d, h, mi, s)), allDay: false };
	}
	// DATE-TIME floating: YYYYMMDDTHHmmss
	return { date: new Date(y, mo, d, h, mi, s), allDay: false };
}

// Days and weeks are nominal durations (RFC 5545 3.3.6): they move the
// local calendar day, so a week-long event stays at the same wall clock
// across a daylight saving change. Hours and below are exact.
function addDuration(start: Date, value: string): Date | null {
	const match = value.trim().match(DURATION_RE);
	if (!match) return null;

	const [, w, d, h, mi, s] = match;
	const days = +(w || 0) * 7 + +(d || 0);
	const ms = +(h || 0) * 3600000 + +(mi || 0) * 60000 + +(s || 0) * 1000;
	if (!days && !ms) return null;

	const end = new Date(start);
	if (days) end.setDate(end.getDate() + days);
	return ms ? new Date(end.getTime() + ms) : end;
}

function unescapeText(value: string): string {
	return value
		.replace(/\\n/g, "\n")
		.replace(/\\,/g, ",")
		.replace(/\\;/g, ";")
		.replace(/\\\\/g, "\\");
}

function parseLine(line: string): { key: string; prop: Property } | null {
	const colon = line.indexOf(":");
	if (colon === -1) return null;

	const [key, ...paramParts] = line.slice(0, colon).split(";");
	const params: Record<string, string> = {};
	for (const part of paramParts) {
		const eq = part.indexOf("=");
		if (eq > 0) params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
	}
	return {
		key: key.toUpperCase(),
		prop: { value: line.slice(colon + 1), params },
	};
}

function first(props: Properties, key: string): string | undefined {
	return props[key]?.[0]?.value;
}

// a canonical local key, so an exception keeps its id when the series is
// written back out and read again in another date form
function occurrenceKey(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return (
		`${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
		`T${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
	);
}

function toEventId(uid: string): EventID {
	return isNaN(Number(uid)) ? uid : Number(uid);
}

function buildEntry(props: Properties): Entry | null {
	const startRaw = first(props, "DTSTART");
	if (!startRaw) return null;

	const { date: start, allDay } = parseDate(startRaw);
	const endRaw = first(props, "DTEND");
	const durationRaw = first(props, "DURATION");
	let end = start;
	if (endRaw) {
		end = parseDate(endRaw).date;
	} else if (durationRaw) {
		end = addDuration(start, durationRaw) ?? start;
	}

	const uid =
		first(props, "UID") ??
		`${Date.now()}-${Math.random().toString(36).slice(2)}`;

	const event: CalendarEvent = { id: toEventId(uid), start, end };
	if (allDay) event.allDay = true;

	const summary = first(props, "SUMMARY");
	if (summary) event.text = unescapeText(summary);
	const description = first(props, "DESCRIPTION");
	if (description) event.description = unescapeText(description);

	const rrule = first(props, "RRULE");
	if (rrule) event.rrule = rrule;

	// EXDATE may repeat and each line may hold a comma-separated list
	const exdates: Date[] = [];
	for (const prop of props["EXDATE"] ?? []) {
		for (const part of prop.value.split(",")) {
			if (part) exdates.push(parseDate(part).date);
		}
	}
	if (exdates.length) event.exdates = exdates;

	const recurrenceRaw = first(props, "RECURRENCE-ID");
	if (!recurrenceRaw) return { uid, event };

	const recurrenceId = parseDate(recurrenceRaw).date;
	return {
		uid,
		event,
		recurrenceId,
		recurrenceKey: occurrenceKey(recurrenceId),
	};
}

export function parseICal(ics: string): CalendarEvent[] {
	const lines = unfold(ics).split(/\r?\n/);
	const entries: Entry[] = [];
	let props: Properties | null = null;
	let nested = 0;

	for (const line of lines) {
		if (props === null) {
			if (line === "BEGIN:VEVENT") {
				props = {};
				nested = 0;
			}
			continue;
		}

		// a VEVENT may hold sub-components - a VALARM carries its own
		// DESCRIPTION and DURATION, which are not the event's
		if (nested === 0 && line === "END:VEVENT") {
			const entry = buildEntry(props);
			if (entry) entries.push(entry);
			props = null;
			continue;
		}
		if (line.startsWith("BEGIN:")) {
			nested++;
			continue;
		}
		if (line.startsWith("END:")) {
			if (nested > 0) nested--;
			continue;
		}
		if (nested > 0) continue;

		const parsed = parseLine(line);
		if (parsed) (props[parsed.key] ??= []).push(parsed.prop);
	}

	// a VEVENT carrying RECURRENCE-ID overrides one occurrence of the series
	// sharing its UID; without that master it is just a standalone event
	const masters = new Map<string, Entry>();
	for (const entry of entries) {
		if (!entry.recurrenceId && !masters.has(entry.uid)) {
			masters.set(entry.uid, entry);
		}
	}

	for (const entry of entries) {
		const master = entry.recurrenceId && masters.get(entry.uid);
		if (!master) continue;
		entry.event.id = `${entry.uid}-${entry.recurrenceKey}`;
		entry.event.masterEventId = master.event.id;
		entry.event.originalDate = entry.recurrenceId;
	}

	return entries.map(entry => entry.event);
}
