import type { StoreActions, ICalendarStore } from "../types";

export function navigateTo(
	store: ICalendarStore,
	action: StoreActions["navigate-to"]
) {
	const updates: {
		currentDate?: Date;
		currentView?: string;
	} = {};

	if (action.date) {
		updates.currentDate = action.date;
	}

	if (action.view && store.getView(action.view)) {
		updates.currentView = action.view;
	}

	if (Object.keys(updates).length) {
		store.setState(updates);
	}
}
