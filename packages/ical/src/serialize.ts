import type { CalendarEvent } from "./types";

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

// Dates are written exactly as they read back: an all-day value as a plain
// date, everything else as a UTC date-time.
function formatDate(date: Date, allDay: boolean): string {
	if (allDay) {
		return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
	}
	const day = `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
	const time = `${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}`;
	return `${day}T${time}Z`;
}

function escapeText(value: string): string {
	return value
		.replace(/\\/g, "\\\\")
		.replace(/,/g, "\\,")
		.replace(/;/g, "\\;")
		.replace(/\n/g, "\\n");
}

function foldLine(line: string): string {
	if (line.length <= 75) return line;
	const chunks: string[] = [line.slice(0, 75)];
	let i = 75;
	while (i < line.length) {
		chunks.push(" " + line.slice(i, i + 74));
		i += 74;
	}
	return chunks.join("\r\n");
}

// An all-day length is nominal (RFC 5545 3.3.6): it moves the local calendar
// day, so a day-long occurrence still ends at midnight on a day a daylight
// saving change made 23 or 25 hours long.
function addDuration(start: Date, duration: number, allDay: boolean): Date {
	if (!allDay) return new Date(start.getTime() + duration);
	const days = Math.max(1, Math.round(duration / 86400000));
	const end = new Date(start);
	end.setDate(end.getDate() + days);
	return end;
}

// A recurring master's `end` is the range envelope of the whole series, not
// the end of its first occurrence - which is what DTEND has to name.
function instanceEnd(event: CalendarEvent, allDay: boolean): Date {
	const duration = Number(event.duration);
	return event.rrule && Number.isFinite(duration)
		? addDuration(event.start, duration, allDay)
		: event.end;
}

function isException(event: CalendarEvent): boolean {
	return event.masterEventId != null && event.originalDate instanceof Date;
}

export function serializeICal(events: CalendarEvent[]): string {
	const now = formatDate(new Date(), false);
	const lines: string[] = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//wx//calendar-ical//EN",
	];

	// a RECURRENCE-ID has to use the value type of the series it overrides,
	// which is not always the type of the override itself
	const masters = new Map(events.map(ev => [ev.id, ev]));

	for (const ev of events) {
		const allDay = ev.allDay ?? false;
		const dateParam = allDay ? ";VALUE=DATE" : "";

		lines.push("BEGIN:VEVENT");
		// an exception shares the UID of the series it overrides
		lines.push(`UID:${isException(ev) ? ev.masterEventId : ev.id}`);
		lines.push(`DTSTAMP:${now}`);
		if (isException(ev)) {
			// fall back to the override's own type when the master is not
			// part of this export
			const master = masters.get(ev.masterEventId!);
			const idAllDay = (master ? master.allDay : ev.allDay) ?? false;
			const idParam = idAllDay ? ";VALUE=DATE" : "";
			lines.push(
				`RECURRENCE-ID${idParam}:${formatDate(ev.originalDate!, idAllDay)}`
			);
		}
		lines.push(`DTSTART${dateParam}:${formatDate(ev.start, allDay)}`);
		lines.push(
			`DTEND${dateParam}:${formatDate(instanceEnd(ev, allDay), allDay)}`
		);
		if (ev.rrule) lines.push(`RRULE:${ev.rrule}`);
		if (ev.exdates?.length) {
			const dates = ev.exdates.map(d => formatDate(d, allDay)).join(",");
			lines.push(`EXDATE${dateParam}:${dates}`);
		}
		if (ev.text) lines.push(`SUMMARY:${escapeText(ev.text)}`);
		if (ev.description)
			lines.push(`DESCRIPTION:${escapeText(String(ev.description))}`);
		lines.push("END:VEVENT");
	}

	lines.push("END:VCALENDAR");
	return lines.map(foldLine).join("\r\n") + "\r\n";
}
