import type { StoreActions, ICalendarStore } from "../types";

export function provideData(
	store: ICalendarStore,
	action: StoreActions["provide-data"]
) {
	const { events } = store.getState();

	if (action.reset) {
		events.clear();
	}

	for (const event of action.data.events) {
		events.addEvent(event, !action.reset);
	}

	store.setState({ events });
}
