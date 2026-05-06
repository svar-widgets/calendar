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
