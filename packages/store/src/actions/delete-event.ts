import type { ICalendarStore, State } from "../types";
import type { EventID } from "../types";

export function deleteEvent(store: ICalendarStore, params: { id: EventID }) {
	const { events, editorData } = store.getState();
	events.removeEvent(params.id);

	const updates: Partial<State> = { events };
	if (editorData?.id === params.id) {
		updates.editorData = null;
	}

	store.setState(updates);
}
