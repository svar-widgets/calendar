import { test, expect } from "vite-plus/test";
import { parseICal } from "../src/parse";

const basicIcs = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:1
DTSTART:20250515T100000Z
DTEND:20250515T110000Z
SUMMARY:Team meeting
END:VEVENT
END:VCALENDAR`;

test("parses UTC datetime event", () => {
	const events = parseICal(basicIcs);
	expect(events).toHaveLength(1);
	const ev = events[0];
	expect(ev.id).toBe(1);
	expect(ev.text).toBe("Team meeting");
	expect(ev.start).toEqual(new Date(Date.UTC(2025, 4, 15, 10, 0, 0)));
	expect(ev.end).toEqual(new Date(Date.UTC(2025, 4, 15, 11, 0, 0)));
	expect(ev.allDay).toBeUndefined();
});

test("parses all-day event", () => {
	const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:2
DTSTART;VALUE=DATE:20250520
DTEND;VALUE=DATE:20250521
SUMMARY:Holiday
END:VEVENT
END:VCALENDAR`;
	const events = parseICal(ics);
	expect(events).toHaveLength(1);
	expect(events[0].allDay).toBe(true);
	expect(events[0].start).toEqual(new Date(2025, 4, 20));
});

test("parses floating datetime event", () => {
	const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:3
DTSTART:20250601T090000
DTEND:20250601T100000
SUMMARY:Local event
END:VEVENT
END:VCALENDAR`;
	const events = parseICal(ics);
	expect(events).toHaveLength(1);
	expect(events[0].start).toEqual(new Date(2025, 5, 1, 9, 0, 0));
	expect(events[0].allDay).toBeUndefined();
});

test("unescapes text values", () => {
	const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:4
DTSTART:20250515T100000Z
DTEND:20250515T110000Z
SUMMARY:Meeting\\, room 1
DESCRIPTION:See you there\\nBring notes
END:VEVENT
END:VCALENDAR`;
	const events = parseICal(ics);
	expect(events[0].text).toBe("Meeting, room 1");
	expect(events[0].description).toBe("See you there\nBring notes");
});

test("handles line folding", () => {
	const ics =
		"BEGIN:VCALENDAR\r\nBEGIN:VEVENT\r\nUID:5\r\nDTSTART:20250515T100000Z\r\nDTEND:20250515T110000Z\r\nSUMMARY:This is a very long summary that exceeds seventy-five characters and\r\n  must be unfolded\r\nEND:VEVENT\r\nEND:VCALENDAR";
	const events = parseICal(ics);
	expect(events[0].text).toBe(
		"This is a very long summary that exceeds seventy-five characters and must be unfolded"
	);
});

test("parses multiple events", () => {
	const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:10
DTSTART:20250501T090000Z
DTEND:20250501T100000Z
SUMMARY:First
END:VEVENT
BEGIN:VEVENT
UID:11
DTSTART:20250502T090000Z
DTEND:20250502T100000Z
SUMMARY:Second
END:VEVENT
END:VCALENDAR`;
	const events = parseICal(ics);
	expect(events).toHaveLength(2);
	expect(events[0].text).toBe("First");
	expect(events[1].text).toBe("Second");
});

test("generates id when UID is missing", () => {
	const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
DTSTART:20250515T100000Z
DTEND:20250515T110000Z
END:VEVENT
END:VCALENDAR`;
	const events = parseICal(ics);
	expect(events[0].id).toBeTruthy();
});

const RECURRING_ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:42
DTSTART:20260302T090000
DTEND:20260302T100000
RRULE:FREQ=WEEKLY;BYDAY=MO;COUNT=5
EXDATE:20260309T090000
EXDATE:20260323T090000,20260330T090000
SUMMARY:Standup
END:VEVENT
BEGIN:VEVENT
UID:42
RECURRENCE-ID:20260316T090000
DTSTART:20260316T110000
DTEND:20260316T120000
SUMMARY:Standup (moved)
END:VEVENT
END:VCALENDAR`;

test("parses an RRULE onto the master event", () => {
	const [master] = parseICal(RECURRING_ICS);
	expect(master.id).toBe(42);
	expect(master.rrule).toBe("FREQ=WEEKLY;BYDAY=MO;COUNT=5");
	expect(master.text).toBe("Standup");
});

test("collects EXDATEs from repeated lines and comma lists", () => {
	const [master] = parseICal(RECURRING_ICS);
	expect(master.exdates).toEqual([
		new Date(2026, 2, 9, 9, 0),
		new Date(2026, 2, 23, 9, 0),
		new Date(2026, 2, 30, 9, 0),
	]);
});

test("turns a RECURRENCE-ID event into an exception of its master", () => {
	const [master, exception] = parseICal(RECURRING_ICS);
	expect(exception.id).toBe("42-20260316T090000");
	expect(exception.masterEventId).toBe(master.id);
	expect(exception.originalDate).toEqual(new Date(2026, 2, 16, 9, 0));
	expect(exception.start).toEqual(new Date(2026, 2, 16, 11, 0));
	expect(exception.rrule).toBeUndefined();
});

test("a RECURRENCE-ID without its master stays a standalone event", () => {
	const events = parseICal(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:99
RECURRENCE-ID:20260316T090000
DTSTART:20260316T110000
DTEND:20260316T120000
END:VEVENT
END:VCALENDAR`);
	expect(events).toHaveLength(1);
	expect(events[0].id).toBe(99);
	expect(events[0].masterEventId).toBeUndefined();
});

test("reads DTSTART with a TZID as written", () => {
	const [event] = parseICal(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:7
DTSTART;TZID=America/New_York:20260302T090000
DTEND;TZID=America/New_York:20260302T100000
END:VEVENT
END:VCALENDAR`);
	expect(event.start).toEqual(new Date(2026, 2, 2, 9, 0));
	expect(event.end).toEqual(new Date(2026, 2, 2, 10, 0));
});

test("derives the end from DURATION when DTEND is missing", () => {
	const [event] = parseICal(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:8
DTSTART:20260302T090000
DURATION:PT1H30M
END:VEVENT
END:VCALENDAR`);
	expect(event.end).toEqual(new Date(2026, 2, 2, 10, 30));
});

test("reads a week-long DURATION", () => {
	const [event] = parseICal(`BEGIN:VCALENDAR
BEGIN:VEVENT
UID:9
DTSTART;VALUE=DATE:20260302
DURATION:P1W
END:VEVENT
END:VCALENDAR`);
	expect(event.allDay).toBe(true);
	expect(event.end).toEqual(new Date(2026, 2, 9));
});
