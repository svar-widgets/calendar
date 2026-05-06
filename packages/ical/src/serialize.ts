import type { CalendarEvent } from "./types";

function formatDate(date: Date, allDay: boolean): string {
	if (allDay) {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}${m}${d}`;
	}
	const y = date.getUTCFullYear();
	const mo = String(date.getUTCMonth() + 1).padStart(2, "0");
	const d = String(date.getUTCDate()).padStart(2, "0");
	const h = String(date.getUTCHours()).padStart(2, "0");
	const mi = String(date.getUTCMinutes()).padStart(2, "0");
	const s = String(date.getUTCSeconds()).padStart(2, "0");
	return `${y}${mo}${d}T${h}${mi}${s}Z`;
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

export function serializeICal(events: CalendarEvent[]): string {
	const now = formatDate(new Date(), false);
	const lines: string[] = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//wx//calendar-ical//EN",
	];

	for (const ev of events) {
		const allDay = ev.allDay ?? false;
		lines.push("BEGIN:VEVENT");
		lines.push(`UID:${ev.id}`);
		lines.push(`DTSTAMP:${now}`);
		if (allDay) {
			lines.push(`DTSTART;VALUE=DATE:${formatDate(ev.start, true)}`);
			lines.push(`DTEND;VALUE=DATE:${formatDate(ev.end, true)}`);
		} else {
			lines.push(`DTSTART:${formatDate(ev.start, false)}`);
			lines.push(`DTEND:${formatDate(ev.end, false)}`);
		}
		if (ev.text) lines.push(`SUMMARY:${escapeText(ev.text)}`);
		if (ev.description)
			lines.push(`DESCRIPTION:${escapeText(String(ev.description))}`);
		lines.push("END:VEVENT");
	}

	lines.push("END:VCALENDAR");
	return lines.map(foldLine).join("\r\n") + "\r\n";
}
