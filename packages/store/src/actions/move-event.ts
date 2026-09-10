import type {
	CalendarEvent,
	EventID,
	ICalendarStore,
	StoreActions,
} from "../types";
import { decodeId } from "../helpers/ids";
import { updateEvent } from "./update-event";

function replaceAssignment(
	event: CalendarEvent,
	updates: Partial<CalendarEvent>,
	sourceUnitId: EventID
): Partial<CalendarEvent> {
	const result = { ...updates };

	for (const key of Object.keys(updates)) {
		const current = event[key];
		const destination = updates[key];
		if (!Array.isArray(current) || Array.isArray(destination)) continue;

		const index = current.findIndex(id => id === sourceUnitId);
		if (index === -1) continue;

		const next = [...current];
		next[index] = destination;
		result[key] = [...new Set(next)];
	}

	return result;
}

export function moveEvent(
	store: ICalendarStore,
	action: StoreActions["move-event"]
) {
	const original = store.getState().events.getEvent(action.id);
	const sourceUnitId = decodeId(action.rawId ?? action.id).unitId;
	if (original && sourceUnitId !== undefined) {
		action.event = replaceAssignment(original, action.event, sourceUnitId);
	}

	updateEvent(store, action);
}
