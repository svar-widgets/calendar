import type { StoreActions, ICalendarStore } from "../types";

export function filterEvents(
	store: ICalendarStore,
	action: StoreActions["filter-events"]
) {
	const { filter, tag } = action;
	const prev = store.getState().filters;

	if (!filter) {
		if (!tag) {
			// no filter, no tag → clear all
			store.setState({ filters: new Map() });
		} else if (prev.has(tag)) {
			// no filter, with tag → remove that tag
			const next = new Map(prev);
			next.delete(tag);
			store.setState({ filters: next });
		}
	} else {
		// set/replace filter (use tag or default key)
		const next = new Map(prev);
		next.set(tag || "_default", filter);
		store.setState({ filters: next });
	}
}
