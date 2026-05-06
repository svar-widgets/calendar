import type { EventBus } from "@svar-ui/lib-state";
import type { StoreActions, ICalendarStore } from "../types";

export function navigateTime(
	store: ICalendarStore,
	bus: EventBus<StoreActions, keyof StoreActions>,
	action: StoreActions["navigate-time"]
) {
	const { _view, currentDate } = store.getState();

	let date: Date;
	switch (action.direction) {
		case "next":
			date = _view.addRange(currentDate, 1);
			break;
		case "previous":
			date = _view.addRange(currentDate, -1);
			break;
		case "now":
			date = new Date();
			break;
	}

	void bus.exec("navigate-to", { date });
}
