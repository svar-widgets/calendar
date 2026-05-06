import { test, expect } from "vite-plus/test";
import { CalendarStore } from "../src/calendar_store";
import { addEvent } from "../src/actions/add-event";
import { updateEvent } from "../src/actions/update-event";
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
	expect(action.event.id).toBe(action.id);
	expect(action.event.text).toBe("Draft event");
	expect(action.event.start).toBeInstanceOf(Date);
	expect(action.event.end).toBeInstanceOf(Date);
	expect(store.getState().editorData?.id).toBe(action.id);
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
