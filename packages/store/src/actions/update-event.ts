import type { StoreActions, ICalendarStore } from "../types";
import { normalizeAllDayUpdate } from "../helpers/allDay";

export function updateEvent(
	store: ICalendarStore,
	action: StoreActions["update-event"]
) {
	const { events } = store.getState();
	const event = normalizeAllDayUpdate(action.event, events.getEvent(action.id));
	action.event = event;
	const updated = events.updateEvent(
		action.id,
		event,
		action.mode,
		action.originalDate
	);
	if (updated) store.setState({ events });
}
