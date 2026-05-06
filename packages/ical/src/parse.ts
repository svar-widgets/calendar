import type { CalendarEvent } from "./types";

function unfold(ics: string): string {
	return ics.replace(/\r?\n[ \t]/g, "");
}

function parseDate(value: string): { date: Date; allDay: boolean } {
	// DATE-only: YYYYMMDD
	if (/^\d{8}$/.test(value)) {
		const y = +value.slice(0, 4);
		const m = +value.slice(4, 6) - 1;
		const d = +value.slice(6, 8);
		return { date: new Date(y, m, d), allDay: true };
	}
	// DATE-TIME UTC: YYYYMMDDTHHmmssZ
	if (value.endsWith("Z")) {
		const y = +value.slice(0, 4);
		const mo = +value.slice(4, 6) - 1;
		const d = +value.slice(6, 8);
		const h = +value.slice(9, 11);
		const mi = +value.slice(11, 13);
		const s = +value.slice(13, 15);
		return { date: new Date(Date.UTC(y, mo, d, h, mi, s)), allDay: false };
	}
	// DATE-TIME floating: YYYYMMDDTHHmmss
	const y = +value.slice(0, 4);
	const mo = +value.slice(4, 6) - 1;
	const d = +value.slice(6, 8);
	const h = +value.slice(9, 11);
	const mi = +value.slice(11, 13);
	const s = +value.slice(13, 15);
	return { date: new Date(y, mo, d, h, mi, s), allDay: false };
}

function unescapeText(value: string): string {
	return value
		.replace(/\\n/g, "\n")
		.replace(/\\,/g, ",")
		.replace(/\\;/g, ";")
		.replace(/\\\\/g, "\\");
}

export function parseICal(ics: string): CalendarEvent[] {
	const lines = unfold(ics).split(/\r?\n/);
	const events: CalendarEvent[] = [];
	let current: Record<string, string> | null = null;

	for (const line of lines) {
		if (line === "BEGIN:VEVENT") {
			current = {};
		} else if (line === "END:VEVENT" && current) {
			const uid = current["UID"];
			const startRaw = current["DTSTART"] ?? "";
			const endRaw = current["DTEND"] ?? "";

			if (startRaw) {
				const { date: start, allDay } = parseDate(startRaw);
				const { date: end } = endRaw ? parseDate(endRaw) : { date: start };
				const id: string | number = uid
					? isNaN(Number(uid))
						? uid
						: Number(uid)
					: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

				const event: CalendarEvent = { id, start, end };
				if (allDay) event.allDay = true;
				if (current["SUMMARY"]) event.text = unescapeText(current["SUMMARY"]);
				if (current["DESCRIPTION"])
					event.description = unescapeText(current["DESCRIPTION"]);

				events.push(event);
			}
			current = null;
		} else if (current !== null) {
			const colonIdx = line.indexOf(":");
			if (colonIdx === -1) continue;
			// Strip parameters (e.g. DTSTART;TZID=America/New_York → DTSTART)
			const baseKey = line.slice(0, colonIdx).split(";")[0];
			const value = line.slice(colonIdx + 1);
			current[baseKey] = value;
		}
	}

	return events;
}
