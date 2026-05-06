import type { EventBus } from "@svar-ui/lib-state";
import type { StoreActions, ICalendarStore } from "../types";

import { navigateTo } from "./navigate-to";
import { navigateTime } from "./navigate-time";
import { filterEvents } from "./filter-events";
import { updateEvent } from "./update-event";
import { addEvent } from "./add-event";
import { selectEvent } from "./select-event";
import { deleteEvent } from "./delete-event";

export function init(
	inBus: EventBus<StoreActions, keyof StoreActions>,
	store: ICalendarStore
) {
	inBus.on("navigate-to", (params: any) => navigateTo(store, params));
	inBus.on("navigate-time", (params: any) =>
		navigateTime(store, inBus, params)
	);
	inBus.on("filter-events", (params: any) => filterEvents(store, params));
	inBus.on("update-event", (params: any) => updateEvent(store, params));
	inBus.on("add-event", (params: any) => addEvent(store, params));
	inBus.on("select-event", (params: any) => selectEvent(store, params));
	inBus.on("delete-event", (params: any) => deleteEvent(store, params));
}
