import { test, expect } from "vite-plus/test";
import { serializeICal } from "../src/serialize";
import { parseICal } from "../src/parse";

test("serializes a basic event", () => {
	const ics = serializeICal([
		{
			id: 1,
			start: new Date(Date.UTC(2025, 4, 15, 10, 0, 0)),
			end: new Date(Date.UTC(2025, 4, 15, 11, 0, 0)),
			text: "Team meeting",
		},
	]);
	expect(ics).toContain("BEGIN:VCALENDAR");
	expect(ics).toContain("BEGIN:VEVENT");
	expect(ics).toContain("UID:1");
	expect(ics).toContain("DTSTART:20250515T100000Z");
	expect(ics).toContain("DTEND:20250515T110000Z");
	expect(ics).toContain("SUMMARY:Team meeting");
	expect(ics).toContain("END:VEVENT");
	expect(ics).toContain("END:VCALENDAR");
});

test("serializes all-day event with DATE format", () => {
	const ics = serializeICal([
		{
			id: 2,
			start: new Date(2025, 4, 20),
			end: new Date(2025, 4, 21),
			allDay: true,
			text: "Holiday",
		},
	]);
	expect(ics).toContain("DTSTART;VALUE=DATE:20250520");
	expect(ics).toContain("DTEND;VALUE=DATE:20250521");
	expect(ics).not.toContain("DTSTART:202505");
});

test("escapes special characters in summary", () => {
	const ics = serializeICal([
		{
			id: 3,
			start: new Date(Date.UTC(2025, 4, 15, 10, 0, 0)),
			end: new Date(Date.UTC(2025, 4, 15, 11, 0, 0)),
			text: "Meeting, room 1",
		},
	]);
	expect(ics).toContain("SUMMARY:Meeting\\, room 1");
});

test("folds long lines at 75 characters", () => {
	const longText = "A".repeat(100);
	const ics = serializeICal([
		{
			id: 4,
			start: new Date(Date.UTC(2025, 4, 15, 10, 0, 0)),
			end: new Date(Date.UTC(2025, 4, 15, 11, 0, 0)),
			text: longText,
		},
	]);
	for (const line of ics.split("\r\n")) {
		expect(line.length).toBeLessThanOrEqual(75);
	}
});

test("uses CRLF line endings", () => {
	const ics = serializeICal([
		{
			id: 5,
			start: new Date(Date.UTC(2025, 4, 15, 10, 0, 0)),
			end: new Date(Date.UTC(2025, 4, 15, 11, 0, 0)),
		},
	]);
	expect(ics).toMatch(/\r\n/);
	expect(ics.split("\r\n").length).toBeGreaterThan(1);
});

test("round-trips through parseICal and serializeICal", () => {
	const events = [
		{
			id: "abc-123",
			start: new Date(Date.UTC(2025, 5, 10, 14, 30, 0)),
			end: new Date(Date.UTC(2025, 5, 10, 15, 30, 0)),
			text: "Standup",
		},
	];
	const ics = serializeICal(events);
	const parsed = parseICal(ics);
	expect(parsed).toHaveLength(1);
	expect(parsed[0].id).toBe("abc-123");
	expect(parsed[0].text).toBe("Standup");
	expect(parsed[0].start.getTime()).toBe(events[0].start.getTime());
	expect(parsed[0].end.getTime()).toBe(events[0].end.getTime());
});

test("escapes semicolons in text", () => {
	const ics = serializeICal([
		{
			id: 4,
			start: new Date(2025, 4, 15, 10, 0),
			end: new Date(2025, 4, 15, 11, 0),
			text: "Review; then lunch",
		},
	]);
	expect(ics).toContain("SUMMARY:Review\\; then lunch");
	expect(parseICal(ics)[0].text).toBe("Review; then lunch");
});

test("writes a master's DTEND from its first occurrence, not the envelope", () => {
	const ics = serializeICal([
		{
			id: 42,
			start: new Date(2026, 2, 2, 9, 0),
			end: new Date("9999-12-31T23:59:59Z"), // range envelope
			duration: 3600000,
			rrule: "FREQ=WEEKLY;BYDAY=MO",
		},
	]);
	expect(ics).toContain("RRULE:FREQ=WEEKLY;BYDAY=MO");
	expect(ics).not.toContain("9999");
	expect(parseICal(ics)[0].end).toEqual(new Date(2026, 2, 2, 10, 0));
});

test("round-trips a series with exdates and an exception", () => {
	const master = {
		id: 42,
		start: new Date(2026, 2, 2, 9, 0),
		end: new Date("9999-12-31T23:59:59Z"),
		duration: 3600000,
		rrule: "FREQ=WEEKLY;BYDAY=MO",
		exdates: [new Date(2026, 2, 9, 9, 0), new Date(2026, 2, 23, 9, 0)],
		text: "Standup",
	};
	const exception = {
		id: "42-20260316T090000Z",
		masterEventId: 42,
		originalDate: new Date(2026, 2, 16, 9, 0),
		start: new Date(2026, 2, 16, 11, 0),
		end: new Date(2026, 2, 16, 12, 0),
		text: "Standup (moved)",
	};

	const [parsedMaster, parsedException] = parseICal(
		serializeICal([master, exception])
	);

	expect(parsedMaster.id).toBe(42);
	expect(parsedMaster.rrule).toBe(master.rrule);
	expect(parsedMaster.exdates).toEqual(master.exdates);
	expect(parsedMaster.end).toEqual(new Date(2026, 2, 2, 10, 0));

	expect(parsedException.masterEventId).toBe(42);
	expect(parsedException.originalDate).toEqual(exception.originalDate);
	expect(parsedException.start).toEqual(exception.start);
	expect(parsedException.text).toBe("Standup (moved)");
});

test("an exception shares the UID of its master", () => {
	const ics = serializeICal([
		{
			id: "42-20260316T090000Z",
			masterEventId: 42,
			originalDate: new Date(2026, 2, 16, 9, 0),
			start: new Date(2026, 2, 16, 11, 0),
			end: new Date(2026, 2, 16, 12, 0),
		},
	]);
	expect(ics).toContain("UID:42");
	expect(ics).not.toContain("UID:42-");
	expect(ics).toMatch(/RECURRENCE-ID:\d{8}T\d{6}Z/);
});

test("an all-day series writes date-only EXDATEs", () => {
	const ics = serializeICal([
		{
			id: 50,
			start: new Date(2026, 2, 2),
			end: new Date("9999-12-31T23:59:59Z"),
			duration: 86400000,
			allDay: true,
			rrule: "FREQ=DAILY",
			exdates: [new Date(2026, 2, 4)],
		},
	]);
	expect(ics).toContain("EXDATE;VALUE=DATE:20260304");
	expect(parseICal(ics)[0].exdates).toEqual([new Date(2026, 2, 4)]);
});

test("a timed override of an all-day series uses the master's value type", () => {
	const master = {
		id: 60,
		start: new Date(2026, 2, 2),
		end: new Date("9999-12-31T23:59:59Z"),
		duration: 86400000,
		allDay: true,
		rrule: "FREQ=DAILY",
	};
	const exception = {
		id: "60-20260304",
		masterEventId: 60,
		originalDate: new Date(2026, 2, 4),
		start: new Date(2026, 2, 4, 9, 0),
		end: new Date(2026, 2, 4, 10, 0),
	};

	const ics = serializeICal([master, exception]);
	expect(ics).toContain("RECURRENCE-ID;VALUE=DATE:20260304");

	const [, parsedException] = parseICal(ics);
	expect(parsedException.originalDate).toEqual(exception.originalDate);
	expect(parsedException.start).toEqual(exception.start);
	expect(parsedException.allDay).toBeUndefined();
});

test("an all-day override of a timed series uses the master's value type", () => {
	const master = {
		id: 61,
		start: new Date(2026, 2, 2, 9, 0),
		end: new Date("9999-12-31T23:59:59Z"),
		duration: 3600000,
		rrule: "FREQ=DAILY",
	};
	const exception = {
		id: "61-20260304",
		masterEventId: 61,
		originalDate: new Date(2026, 2, 4, 9, 0),
		start: new Date(2026, 2, 4),
		end: new Date(2026, 2, 5),
		allDay: true,
	};

	const ics = serializeICal([master, exception]);
	expect(ics).toMatch(/RECURRENCE-ID:\d{8}T\d{6}Z/);
	expect(ics).not.toContain("RECURRENCE-ID;VALUE=DATE");

	const [, parsedException] = parseICal(ics);
	expect(parsedException.originalDate).toEqual(exception.originalDate);
	expect(parsedException.allDay).toBe(true);
});

test("an override exported without its master falls back to its own type", () => {
	const ics = serializeICal([
		{
			id: "62-20260304",
			masterEventId: 62,
			originalDate: new Date(2026, 2, 4),
			start: new Date(2026, 2, 4),
			end: new Date(2026, 2, 5),
			allDay: true,
		},
	]);
	expect(ics).toContain("RECURRENCE-ID;VALUE=DATE:20260304");
});

test("an all-day master's DTEND holds across a daylight saving change", () => {
	const ics = serializeICal([
		{
			id: 63,
			// a day a fall-back makes 25 hours long in a US timezone
			start: new Date(2026, 10, 1),
			end: new Date("9999-12-31T23:59:59Z"),
			duration: 86400000,
			allDay: true,
			rrule: "FREQ=DAILY",
		},
	]);
	expect(ics).toContain("DTSTART;VALUE=DATE:20261101");
	expect(ics).toContain("DTEND;VALUE=DATE:20261102");
	expect(parseICal(ics)[0].end).toEqual(new Date(2026, 10, 2));
});
