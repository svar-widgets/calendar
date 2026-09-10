import type { StoreActions, ICalendarStore } from "../types";
import { normalizeAllDayUpdate } from "../helpers/allDay";
import { decodeId } from "../helpers/ids";
import { cascadeDeleteExceptions } from "./delete-event";

export function updateEvent(
	store: ICalendarStore,
	action: StoreActions["update-event"]
) {
	const { events } = store.getState();
	const existing = events.getEvent(action.id);
	const event = normalizeAllDayUpdate(action.event, existing);
	const originalDate = decodeId(action.rawId ?? action.id).eventDate;
	const wasRecurring = !!existing?.rrule;
	action.event = event;
	const updated = events.updateEvent(
		action.id,
		event,
		action.mode,
		originalDate
	);
	if (!updated) return;

	const selected = store.getState().editorData;
	store.setState({ events });

	if (originalDate && selected?.id === action.id) {
		void store.in.exec("select-event", {
			id: updated.id,
			rawId: updated.id,
		});
	}

	if (!originalDate && wasRecurring && !updated.rrule) {
		cascadeDeleteExceptions(store, action.id);
	}
}
