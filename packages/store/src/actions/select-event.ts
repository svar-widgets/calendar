import type { ICalendarStore } from "../types";
import type { EventID } from "../types";

export function selectEvent(
	store: ICalendarStore,
	params: { id: EventID | null }
) {
	if (params.id == null) {
		store.setState({ editorData: null });
		return;
	}

	const { events } = store.getState();
	const event = events.getEvent(params.id);
	if (event) {
		store.setState({ editorData: { ...event } });
	}
}
