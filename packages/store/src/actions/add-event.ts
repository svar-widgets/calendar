import type { StoreActions, ICalendarStore, State } from "../types";
import { normalizeAllDayEvent } from "../helpers/allDay";
import { getEditorEvent } from "../helpers/editor";

function hasTimeScale(store: ICalendarStore): boolean {
	const { _view } = store.getState();
	const sections = _view.getSections();
	return sections.some(
		s => s.xScale.type === "time" || s.yScale.type === "time"
	);
}

function roundToNextHour(date: Date): Date {
	const d = new Date(date);
	if (d.getMinutes() > 0 || d.getSeconds() > 0 || d.getMilliseconds() > 0) {
		d.setHours(d.getHours() + 1, 0, 0, 0);
	}
	return d;
}

function applyDefaults(
	event: Partial<import("../types").CalendarEvent>,
	store: ICalendarStore
): Partial<import("../types").CalendarEvent> {
	if (event.start && event.end) return event;

	const { currentDate } = store.getState();

	if (hasTimeScale(store)) {
		const start = event.start ?? roundToNextHour(new Date());
		const end =
			event.end ?? new Date(new Date(start).getTime() + 60 * 60 * 1000);
		return { ...event, start, end };
	} else {
		const start =
			event.start ?? new Date(new Date(currentDate).setHours(0, 0, 0, 0));
		const end =
			event.end ?? new Date(new Date(start).getTime() + 24 * 60 * 60 * 1000);
		return { ...event, allDay: event.allDay ?? true, start, end };
	}
}

export function addEvent(
	store: ICalendarStore,
	action: StoreActions["add-event"]
) {
	const filled = normalizeAllDayEvent(applyDefaults(action.event, store));
	const { events } = store.getState();
	const full = events.addEvent(filled);

	// Forward the normalized event to downstream consumers such as providers.
	action.event = { ...full };
	action.id = full.id;
	action.rawId = full.id;

	const updates: Partial<State> = { events };
	if (action.edit) {
		updates.editorData = getEditorEvent(
			events,
			full,
			"series",
			null,
			full.id,
			!!store.meta.recurring
		);
	}
	store.setState(updates);
}
