import { test, expect } from "vite-plus/test";
import { CalendarStore } from "../src/calendar_store";
import { addEvent } from "../src/actions/add-event";
import { updateEvent } from "../src/actions/update-event";
import { moveEvent } from "../src/actions/move-event";
import { navigateTo } from "../src/actions/navigate-to";
import { navigateTime } from "../src/actions/navigate-time";
import type { StoreActions } from "../src/types";
import type { TWritableCreator } from "@svar-ui/lib-state";

const writable: TWritableCreator = initial => {
	let value = initial;

	return {
		subscribe(fn) {
			fn(value);
		},
		set(next) {
			value = next;
		},
		update(fn) {
			value = fn(value);
		},
	};
};

function expectLocalDateTime(
	date: Date,
	year: number,
	month: number,
	day: number,
	hour = 0,
	minute = 0
) {
	expect(date.getFullYear()).toBe(year);
	expect(date.getMonth()).toBe(month);
	expect(date.getDate()).toBe(day);
	expect(date.getHours()).toBe(hour);
	expect(date.getMinutes()).toBe(minute);
	expect(date.getSeconds()).toBe(0);
	expect(date.getMilliseconds()).toBe(0);
}

test("add-event mutates payload with normalized event data", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date("2026-04-17T09:00:00"),
		events: [] as any,
	});

	const action: StoreActions["add-event"] = {
		event: { text: "Draft event" },
		edit: true,
	};

	addEvent(store, action);

	expect(action.id).toBeDefined();
	expect(action.rawId).toBe(action.id);
	expect(action.event.id).toBe(action.id);
	expect(action.event.text).toBe("Draft event");
	expect(action.event.start).toBeInstanceOf(Date);
	expect(action.event.end).toBeInstanceOf(Date);
	expect(store.getState().editorData?.id).toBe(action.id);
	expect(store.getState().editorData?.values.id).toBe(action.id);
});

test("add-event normalizes explicit allDay times", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date(2026, 3, 17, 9),
		events: [] as any,
	});

	const action: StoreActions["add-event"] = {
		event: {
			text: "Holiday",
			allDay: true,
			start: new Date(2026, 3, 17, 9),
			end: new Date(2026, 3, 17, 11),
		},
		edit: true,
	};

	addEvent(store, action);

	const event = store.getState().events.getEvent(action.id!)!;
	expect(event.allDay).toBe(true);
	expectLocalDateTime(event.start, 2026, 3, 17);
	expectLocalDateTime(event.end, 2026, 3, 18);
	expectLocalDateTime(action.event.start!, 2026, 3, 17);
	expectLocalDateTime(action.event.end!, 2026, 3, 18);
});

test("update-event normalizes allDay switch to full local day", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date(2026, 3, 17, 9),
		events: [
			{
				id: 1,
				text: "Timed event",
				start: new Date(2026, 3, 17, 9),
				end: new Date(2026, 3, 17, 11),
			},
		] as any,
	});

	const action: StoreActions["update-event"] = {
		id: 1,
		event: { allDay: true },
	};

	updateEvent(store, action);

	const event = store.getEvent(1)!;
	expect(event.allDay).toBe(true);
	expectLocalDateTime(event.start, 2026, 3, 17);
	expectLocalDateTime(event.end, 2026, 3, 18);
	expectLocalDateTime(action.event.start!, 2026, 3, 17);
	expectLocalDateTime(action.event.end!, 2026, 3, 18);
});

test("move-event replaces only the source assignment", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["resources"]);
	store.init({
		currentView: "resources",
		currentDate: new Date(2026, 3, 17, 9),
		events: [
			{
				id: 1,
				start: new Date(2026, 3, 17, 9),
				end: new Date(2026, 3, 17, 10),
				assignee: ["alice", "bob"],
			},
		] as any,
	});
	const action: StoreActions["move-event"] = {
		id: 1,
		rawId: "1##:bob#",
		event: {
			start: new Date(2026, 3, 17, 11),
			end: new Date(2026, 3, 17, 12),
			assignee: "charlie",
		},
	};

	moveEvent(store, action);

	expect(store.getEvent(1)!.assignee).toEqual(["alice", "charlie"]);
	expect(action.event.assignee).toEqual(["alice", "charlie"]);
	expectLocalDateTime(store.getEvent(1)!.start, 2026, 3, 17, 11);
});

test("move-event deduplicates an existing destination assignment", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["resources"]);
	store.init({
		currentView: "resources",
		currentDate: new Date(2026, 3, 17, 9),
		events: [
			{
				id: 1,
				start: new Date(2026, 3, 17, 9),
				end: new Date(2026, 3, 17, 10),
				assignee: ["alice", "bob"],
			},
		] as any,
	});

	moveEvent(store, {
		id: 1,
		rawId: "1##:bob#",
		event: { assignee: "alice" },
	});

	expect(store.getEvent(1)!.assignee).toEqual(["alice"]);
});

test("move-event keeps scalar and date updates unchanged", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["resources"]);
	store.init({
		currentView: "resources",
		currentDate: new Date(2026, 3, 17, 9),
		events: [
			{
				id: 1,
				start: new Date(2026, 3, 17, 9),
				end: new Date(2026, 3, 17, 10),
				assignee: "alice",
			},
		] as any,
	});

	moveEvent(store, {
		id: 1,
		event: {
			start: new Date(2026, 3, 18, 9),
			end: new Date(2026, 3, 18, 10),
			assignee: "bob",
		},
	});

	expect(store.getEvent(1)!.assignee).toBe("bob");
	expectLocalDateTime(store.getEvent(1)!.start, 2026, 3, 18, 9);
});

test("move-event refreshes multi-unit view sections", async () => {
	const store = new CalendarStore(writable);
	store.configureViews([
		{
			id: "resources",
			sections: {
				timeGrid: {
					xScale: {
						items: [
							{ id: "alice", label: "Alice" },
							{ id: "bob", label: "Bob" },
							{ id: "charlie", label: "Charlie" },
						],
						accessor: "assignee",
						multiple: true,
					},
				},
			},
		},
	]);
	store.init({
		currentView: "resources",
		currentDate: new Date(2026, 3, 17, 9),
		events: [
			{
				id: 1,
				start: new Date(2026, 3, 17, 9),
				end: new Date(2026, 3, 17, 10),
				assignee: ["alice", "bob"],
			},
		] as any,
	});

	await store.in.exec("move-event", {
		id: 1,
		rawId: "1##:bob#",
		event: { assignee: "charlie" },
	});

	const primitives = store.getState().viewData[0].primitives;
	expect(store.getEvent(1)!.assignee).toEqual(["alice", "charlie"]);
	expect(primitives).toHaveLength(2);
	expect(primitives.map((primitive: any) => primitive.x)).toEqual([0, 200 / 3]);
});

test("navigate-to updates current date without changing view", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day", "week"]);
	store.init({
		currentView: "week",
		currentDate: new Date("2026-04-17T09:00:00"),
		events: [] as any,
	});

	navigateTo(store, { date: new Date("2026-04-20T09:00:00") });

	const state = store.getState();
	expect(state.currentView).toBe("week");
	expect(state.currentDate.getTime()).toBe(
		new Date("2026-04-20T09:00:00").getTime()
	);
});

test("navigate-to updates current view without changing date", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day", "week"]);
	store.init({
		currentView: "week",
		currentDate: new Date("2026-04-17T09:00:00"),
		events: [] as any,
	});

	navigateTo(store, { view: "day" });

	const state = store.getState();
	expect(state.currentView).toBe("day");
	expect(state.currentDate.getTime()).toBe(
		new Date("2026-04-17T09:00:00").getTime()
	);
});

test("navigate-to updates both date and view", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day", "week"]);
	store.init({
		currentView: "week",
		currentDate: new Date("2026-04-17T09:00:00"),
		events: [] as any,
	});

	navigateTo(store, {
		date: new Date("2026-04-20T09:00:00"),
		view: "day",
	});

	const state = store.getState();
	expect(state.currentView).toBe("day");
	expect(state.currentDate.getTime()).toBe(
		new Date("2026-04-20T09:00:00").getTime()
	);
});

test("store emits request-data when visible range changes", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	const requests: StoreActions["request-data"][] = [];
	store.in.on("request-data", payload => {
		requests.push(payload as StoreActions["request-data"]);
	});

	store.init({
		currentView: "day",
		currentDate: new Date(2026, 3, 17, 9),
		events: [] as any,
	});

	expect(requests).toHaveLength(1);
	expectLocalDateTime(requests[0].startDate, 2026, 3, 17);
	expectLocalDateTime(requests[0].endDate, 2026, 3, 18);
	expect(requests[0].date.getTime()).toBe(new Date(2026, 3, 17, 9).getTime());
	expect(requests[0].view).toBe("day");
});

test("store skips request-data when view switch keeps the same range", async () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day", "resources"]);
	const requests: StoreActions["request-data"][] = [];
	store.in.on("request-data", payload => {
		requests.push(payload as StoreActions["request-data"]);
	});

	store.init({
		currentView: "day",
		currentDate: new Date(2026, 3, 17, 9),
		events: [] as any,
	});

	await store.in.exec("navigate-to", { view: "resources" });

	expect(requests).toHaveLength(1);
});

test("provide-data merges incoming events by replacing matching ids", async () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date(2026, 3, 17, 9),
		events: [
			{
				id: 1,
				text: "old",
				custom: "remove me",
				start: new Date(2026, 3, 17, 10),
				end: new Date(2026, 3, 17, 11),
			},
			{
				id: 2,
				text: "keep",
				start: new Date(2026, 3, 17, 12),
				end: new Date(2026, 3, 17, 13),
			},
		] as any,
	});

	await store.in.exec("provide-data", {
		data: {
			events: [
				{
					id: 1,
					text: "new",
					start: new Date(2026, 3, 17, 14),
					end: new Date(2026, 3, 17, 15),
				},
			],
		},
	});

	const out = store.getEvents();
	expect(out).toHaveLength(2);
	expect(store.getEvent(1)!.text).toBe("new");
	expect(store.getEvent(1)!.custom).toBeUndefined();
	expect(store.getEvent(2)!.text).toBe("keep");
});

test("provide-data reset replaces existing events", async () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date(2026, 3, 17, 9),
		events: [
			{
				id: 1,
				text: "old",
				start: new Date(2026, 3, 17, 10),
				end: new Date(2026, 3, 17, 11),
			},
		] as any,
	});

	await store.in.exec("provide-data", {
		reset: true,
		data: {
			events: [
				{
					id: 2,
					text: "new",
					start: new Date(2026, 3, 17, 12),
					end: new Date(2026, 3, 17, 13),
				},
			],
		},
	});

	expect(store.getEvents()).toHaveLength(1);
	expect(store.getEvent(1)).toBeUndefined();
	expect(store.getEvent(2)!.text).toBe("new");
});

test("navigate-time now dispatches today, not the active view range start", () => {
	const rangeStart = new Date(2000, 0, 1);
	const store = {
		getState: () => ({
			currentDate: new Date(2026, 3, 17, 9),
			_view: {
				rangeStart: () => rangeStart,
				addRange: () => new Date(2026, 3, 24),
			},
		}),
	} as any;
	let payload: StoreActions["navigate-to"] | undefined;
	const bus = {
		exec: (_action: "navigate-to", data: StoreActions["navigate-to"]) => {
			payload = data;
		},
	} as any;

	const before = new Date();
	navigateTime(store, bus, { direction: "now" });
	const after = new Date();

	expect(payload?.date).toBeInstanceOf(Date);
	expect(payload?.date).not.toBe(rangeStart);
	expect(payload!.date!.getTime()).toBeGreaterThanOrEqual(before.getTime());
	expect(payload!.date!.getTime()).toBeLessThanOrEqual(after.getTime());
});

test("getEvents returns all events as a plain array", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date("2026-04-17T09:00:00"),
		events: [
			{
				id: 1,
				start: new Date("2026-04-17T10:00:00"),
				end: new Date("2026-04-17T11:00:00"),
				text: "A",
			},
			{
				id: 2,
				start: new Date("2026-04-18T10:00:00"),
				end: new Date("2026-04-18T11:00:00"),
				text: "B",
			},
		] as any,
	});

	const out = store.getEvents();
	expect(Array.isArray(out)).toBe(true);
	expect(out).toHaveLength(2);
	expect(out.map(e => e.id).sort((a, b) => Number(a) - Number(b))).toEqual([
		1, 2,
	]);
});

test("getEvents reflects events added after init", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date("2026-04-17T09:00:00"),
		events: [] as any,
	});

	addEvent(store, { event: { text: "added" }, edit: false });

	const out = store.getEvents();
	expect(out).toHaveLength(1);
	expect(out[0].text).toBe("added");
});

test("getEvents returns empty array when no events", () => {
	const store = new CalendarStore(writable);
	store.configureViews(["day"]);
	store.init({
		currentView: "day",
		currentDate: new Date("2026-04-17T09:00:00"),
		events: [] as any,
	});

	expect(store.getEvents()).toEqual([]);
});
