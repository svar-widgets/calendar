import type { TDataConfig } from "@svar-ui/lib-state";
import type { ICalendarStore, State } from "./types";

function sameRange(
	left: { start: Date; end: Date },
	right: { start: Date; end: Date }
) {
	return (
		left.start.getTime() === right.start.getTime() &&
		left.end.getTime() === right.end.getTime()
	);
}

export function reactive(store: ICalendarStore): TDataConfig {
	return [
		{
			in: ["currentDate", "currentView"],
			out: ["rangeLabel", "visibleDateRange"],
			exec: (ctx: TDataConfig) => {
				const { currentView, currentDate, visibleDateRange } = store.getState();
				const view = store.getView(currentView);
				const [start, end] = view.setRange(currentDate);
				const nextRange = { start, end };
				const rangeChanged = !sameRange(visibleDateRange, nextRange);

				const update = {
					rangeLabel: view.getRangeLabel(),
				} as Partial<State>;
				if (rangeChanged) update.visibleDateRange = nextRange;

				store.setState(update, ctx);

				if (rangeChanged) {
					void store.in.exec("request-data", {
						startDate: start,
						endDate: end,
						date: currentDate,
						view: currentView,
					});
				}
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
