import type { ICalendarStore, State, StoreActions, EventID } from "../types";

// Exceptions are independent records linked only by masterEventId, so they
// survive their series. Remove them through the bus (after the master-level
// operation) so providers see every deletion; backends that cascade via a
// real foreign key can simply ignore these child operations.
export function cascadeDeleteExceptions(
	store: ICalendarStore,
	masterId: EventID
) {
	const orphans = store
		.getState()
		.events.getEvents()
		.filter(e => e.masterEventId === masterId);
	for (const orphan of orphans) {
		void store.in.exec("delete-event", {
			id: orphan.id,
			rawId: orphan.id,
			cascade: true,
		});
	}
}

export function deleteEvent(
	store: ICalendarStore,
	params: StoreActions["delete-event"]
) {
	const { events, editorData } = store.getState();
	const existing = events.getEvent(params.id);
	events.removeEvent(params.id);

	const updates: Partial<State> = { events };
	if (editorData?.id === params.id) {
		updates.editorData = null;
	}

	store.setState(updates);

	if (existing?.rrule) {
		cascadeDeleteExceptions(store, params.id);
	}
}
