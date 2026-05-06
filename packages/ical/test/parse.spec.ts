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
