import { test, expect } from "vite-plus/test";
import { isTempID } from "@svar-ui/lib-state";
import { EventsStore } from "../src/events_store";

test("addEvent auto-generates ID", () => {
	const store = new EventsStore();
	const ev = store.addEvent({
		start: new Date("2025-10-28T10:00"),
		end: new Date("2025-10-28T11:00"),
		title: "Meeting",
	});
	expect(isTempID(ev.id)).toBe(true);
	expect(ev.title).toBe("Meeting");
});

test("getEvent retrieves by ID", () => {
	const store = new EventsStore();
	const ev = store.addEvent({
		start: new Date("2025-10-28T10:00"),
		end: new Date("2025-10-28T11:00"),
	});
	expect(store.getEvent(ev.id)).toBe(ev);
	expect(store.getEvent(999)).toBeUndefined();
});

test("updateEvent merges immutably and locks ID", () => {
	const store = new EventsStore();
	const ev = store.addEvent({
		id: 1,
		start: new Date("2025-10-28T10:00"),
		end: new Date("2025-10-28T11:00"),
		title: "Original",
	});
	const updated = store.updateEvent(1, {
		id: 999 as any,
		title: "Updated",
	});
	expect(updated).not.toBe(ev);
	expect(updated!.id).toBe(1);
	expect(updated!.title).toBe("Updated");
	expect(ev.title).toBe("Original");
});

test("updateEvent returns null for missing ID", () => {
	const store = new EventsStore();
	expect(store.updateEvent(999, { title: "x" })).toBeNull();
});

test("removeEvent returns true/false", () => {
	const store = new EventsStore();
	const ev = store.addEvent({
		start: new Date("2025-10-28T10:00"),
		end: new Date("2025-10-28T11:00"),
	});
	expect(store.removeEvent(ev.id)).toBe(true);
	expect(store.removeEvent(ev.id)).toBe(false);
	expect(store.getCount()).toBe(0);
});

test("getEvents returns all when no args", () => {
	const store = new EventsStore();
	store.addEvent({
		start: new Date("2025-10-28T10:00"),
		end: new Date("2025-10-28T11:00"),
	});
	store.addEvent({
		start: new Date("2025-10-29T10:00"),
		end: new Date("2025-10-29T11:00"),
	});
	const all = store.getEvents();
	expect(all).toHaveLength(2);
});

test("getEvents filters by range overlap", () => {
	const store = new EventsStore();
	store.addEvent({
		id: 1,
		start: new Date("2025-10-27T10:00"),
		end: new Date("2025-10-27T11:00"),
	});
	store.addEvent({
		id: 2,
		start: new Date("2025-10-28T14:00"),
		end: new Date("2025-10-28T15:00"),
	});
	store.addEvent({
		id: 3,
		start: new Date("2025-10-30T09:00"),
		end: new Date("2025-10-30T10:00"),
	});

	const result = store.getEvents(
		new Date("2025-10-28T00:00"),
		new Date("2025-10-29T00:00")
	);
	expect(result).toHaveLength(1);
	expect(result[0].id).toBe(2);
});

test("getEvents boundary exclusion - event ending at range start excluded", () => {
	const store = new EventsStore();
	store.addEvent({
		id: 1,
		start: new Date("2025-10-27T10:00"),
		end: new Date("2025-10-28T00:00"),
	});
	const result = store.getEvents(new Date("2025-10-28T00:00"));
	expect(result).toHaveLength(0);
});

test("getEvents with only start param", () => {
	const store = new EventsStore();
	store.addEvent({
		id: 1,
		start: new Date("2025-10-27T10:00"),
		end: new Date("2025-10-28T10:00"),
	});
	store.addEvent({
		id: 2,
		start: new Date("2025-10-30T10:00"),
		end: new Date("2025-10-30T11:00"),
	});
	const result = store.getEvents(new Date("2025-10-29T00:00"));
	expect(result).toHaveLength(1);
	expect(result[0].id).toBe(2);
});

test("getEvents with only end param", () => {
	const store = new EventsStore();
	store.addEvent({
		id: 1,
		start: new Date("2025-10-27T10:00"),
		end: new Date("2025-10-27T11:00"),
	});
	store.addEvent({
		id: 2,
		start: new Date("2025-10-30T10:00"),
		end: new Date("2025-10-30T11:00"),
	});
	const result = store.getEvents(undefined, new Date("2025-10-28T00:00"));
	expect(result).toHaveLength(1);
	expect(result[0].id).toBe(1);
});

test("clear removes events", () => {
	const store = new EventsStore();
	store.addEvent({
		start: new Date("2025-10-28T10:00"),
		end: new Date("2025-10-28T11:00"),
	});
	store.clear();
	expect(store.getCount()).toBe(0);
});

test("createEventStore with initial data", () => {
	const store = new EventsStore([
		{
			id: 1,
			start: new Date("2025-10-28T10:00"),
			end: new Date("2025-10-28T11:00"),
			title: "A",
		},
		{
			id: 2,
			start: new Date("2025-10-28T14:00"),
			end: new Date("2025-10-28T15:00"),
			title: "B",
		},
	]);
	expect(store.getCount()).toBe(2);
	expect(store.getEvent(1)!.title).toBe("A");
});

test("getCount returns current count", () => {
	const store = new EventsStore();
	expect(store.getCount()).toBe(0);
	store.addEvent({
		start: new Date("2025-10-28T10:00"),
		end: new Date("2025-10-28T11:00"),
	});
	expect(store.getCount()).toBe(1);
});
