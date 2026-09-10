import { test, expect } from "vite-plus/test";
import { parseICal } from "../src/parse";
import { serializeICal } from "../src/serialize";
import { GOOGLE_ICS, OUTLOOK_ICS } from "./fixtures";

// --- Google Calendar ---

test("reads a Google series with its exception", () => {
	const events = parseICal(GOOGLE_ICS);
	expect(events).toHaveLength(2);

	const [master, exception] = events;
	expect(master.id).toBe("6r8k2v9qmt4h1c0d@google.com");
	expect(master.rrule).toBe("FREQ=WEEKLY;WKST=SU;BYDAY=MO");
	expect(master.start).toEqual(new Date(2026, 2, 2, 9, 0));
	expect(master.end).toEqual(new Date(2026, 2, 2, 9, 30));
	expect(master.exdates).toEqual([new Date(2026, 2, 16, 9, 0)]);
	expect(master.text).toBe("Standup");
	expect(master.description).toBe("Daily standup\nBring the sprint board");

	expect(exception.masterEventId).toBe(master.id);
	expect(exception.id).toBe("6r8k2v9qmt4h1c0d@google.com-20260323T090000");
	expect(exception.originalDate).toEqual(new Date(2026, 2, 23, 9, 0));
	expect(exception.start).toEqual(new Date(2026, 2, 23, 11, 0));
	expect(exception.rrule).toBeUndefined();
});

test("a VTIMEZONE does not leak its DTSTART or RRULE into the events", () => {
	const [master] = parseICal(GOOGLE_ICS);
	// the zone blocks carry FREQ=YEARLY rules and 1970/1601 start dates
	expect(master.start.getFullYear()).toBe(2026);
	expect(master.rrule).not.toContain("YEARLY");
});

// --- Outlook ---

test("reads an Outlook series with a folded UID and a comma-list EXDATE", () => {
	const [event] = parseICal(OUTLOOK_ICS);
	expect(event.id).toBe(
		"040000008200E00074C5B7101A82E00800000000B0F5C1A2D4E5DB01000000000000" +
			"000010000000C9A1B2C3D4E5F60718293A4B5C6D7E8F9"
	);
	expect(event.rrule).toBe("FREQ=MONTHLY;BYDAY=1TU;INTERVAL=1");
	expect(event.start).toEqual(new Date(2026, 2, 3, 14, 0));
	expect(event.exdates).toEqual([
		new Date(2026, 5, 2, 14, 0),
		new Date(2026, 6, 7, 14, 0),
	]);
});

test("a VALARM does not leak its DESCRIPTION into the event", () => {
	const [event] = parseICal(OUTLOOK_ICS);
	// the event itself has no DESCRIPTION, only its alarm does
	expect(event.description).toBeUndefined();
	expect(event.text).toBe("Team sync");
});

// --- round-trip ---

test("a Google export survives parse -> serialize -> parse", () => {
	const once = parseICal(GOOGLE_ICS);
	const twice = parseICal(serializeICal(once));
	expect(twice).toEqual(once);
});

test("an Outlook export survives parse -> serialize -> parse", () => {
	const once = parseICal(OUTLOOK_ICS);
	const twice = parseICal(serializeICal(once));
	expect(twice).toEqual(once);
});
