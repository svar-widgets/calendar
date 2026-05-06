import type { TDataConfig } from "@svar-ui/lib-state";
import type { ICalendarStore } from "./types";

export function reactive(store: ICalendarStore): TDataConfig {
	return [
		{
			in: ["currentDate", "currentView"],
			out: ["rangeLabel", "visibleDateRange"],
			exec: (ctx: TDataConfig) => {
				const { currentView, currentDate } = store.getState();
				const view = store.getView(currentView);
				const [start, end] = view.setRange(currentDate);
				store.setState(
					{
						rangeLabel: view.getRangeLabel(),
						visibleDateRange: { start, end },
					},
					ctx
				);
			},
		},
		{
			in: ["currentView"],
			out: ["_view"],
			exec: (ctx: TDataConfig) => {
				const { currentView } = store.getState();
				const view = store.getView(currentView);
				store.setState({ _view: view }, ctx);
			},
		},
		{
			in: ["events", "currentDate", "currentView", "_view", "filters"],
			out: ["viewData"],
			exec: (ctx: TDataConfig) => {
				const { _view, currentDate, events, filters } = store.getState();

				const [startDate, endDate] = _view.setRange(currentDate);
				let evs = events.getEvents(startDate, endDate);
				for (const fn of filters.values()) {
					evs = evs.filter(fn);
				}
				const viewData = _view.process(evs);
				store.setState({ viewData }, ctx);
			},
		},
	];
}
