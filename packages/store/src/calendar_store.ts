import { Store, EventBus, DataRouter } from "@svar-ui/lib-state";
import type { TDataConfig, TWritableCreator } from "@svar-ui/lib-state";

import type {
	FormatFactory,
	Brandmark,
	State,
	StoreActions,
	HistoryActionName,
} from "./types";

import { EventsStore } from "./events_store";
import { ViewModel } from "./models/model";
import { WeekViewModel } from "./models/week_view";
import { DayViewModel } from "./models/day_view";
import { MonthViewModel } from "./models/month_view";


import {
	registerCalendarView,
	getRegisteredViews,
	type ViewConfig,
} from "./registry";
import { init } from "./actions/index";
import { reactive } from "./calendar_reactive";
import { decodeId } from "./helpers/ids";


declare const __TRIAL__: boolean;
declare const window: any;

// Register built-in views
registerCalendarView("week", WeekViewModel);
registerCalendarView("day", DayViewModel);
registerCalendarView("month", MonthViewModel);


export class CalendarStore extends Store<State> {
	public in: EventBus<StoreActions, keyof StoreActions>;
	public meta: Record<string, any> = {};
	private _router: DataRouter<State, Partial<State>, StoreActions>;
	private _views: { [key: string]: any } = {};
	private _weekStartDay: number;
	private _dateFormat: FormatFactory;

	constructor(
		w: TWritableCreator,
		options?: {
			recurring?: boolean;
			weekStart?: number;
			dateFormat?: FormatFactory;
		}
	) {
		const recurring = options?.recurring ?? false;
		let EventsClass: typeof EventsStore = EventsStore;

		super({ writable: w, async: false });
		this.meta.recurring = recurring;
		this._router = new DataRouter(super.setState.bind(this), reactive(this), {
			events: (v: any[]) => {
				const events = new EventsClass(v);
				if (this._history) this._history.reset();
				return events;
			},
		});

		// Initialize with default values

		this._weekStartDay = options?.weekStart ?? 1;
		this._dateFormat =
			options?.dateFormat ?? (() => (d: Date) => d.toLocaleDateString());

		super.setState({
			currentDate: new Date(),
			currentView: "week",
			rangeLabel: "",
			visibleDateRange: { start: new Date(), end: new Date() },
			events: new EventsClass([]),
			viewData: {} as any,
			filters: new Map(),
			editorData: null,
			_view: new WeekViewModel(),
		});


		this.configureViews();

		// Setup event bus for handling all the actions
		const inBus = (this.in = new EventBus());
		init(inBus, this);
	}

	configureViews(views?: ViewConfig[]) {
		const registered = getRegisteredViews();
		this._views = {};

		if (!views) {
			for (const [id, ViewClass] of registered) {
				const instance = new ViewClass();
				this.applyViewConfig(instance);
				this._views[id] = instance;
			}
		} else {
			for (const v of views) {
				const id = typeof v === "string" ? v : v.id;
				const ViewClass = registered.get(id);
				if (!ViewClass) continue;
				const instance = new ViewClass();
				this.applyViewConfig(instance);
				if (typeof v !== "string" && v.sections) {
					instance.configure(v.sections);
				}
				this._views[id] = instance;
			}

			const cv = this.getState().currentView;
			if (cv && this._views[cv]) {
				this.setState({ _view: this._views[cv] });
			}
		}
	}

	init(state: Partial<State>) {
		this._router.init({
			...state,
		});
	}

	postInit() {
	}

	private applyViewConfig(instance: ViewModel) {
		instance.weekStartDay = this._weekStartDay;
		instance.fmt = this._dateFormat;
	}

	getView(name: string) {
		return this._views[name];
	}

	getEvents(start?: Date, end?: Date) {
		return this.getState().events.getEvents(start, end);
	}

	getEvent(id: string | number) {
		return this.getState().events.getEvent(decodeId(id).id);
	}


	getBrandmark(): Brandmark | null {
		if (__TRIAL__) {
			if (typeof window !== "undefined") {
				const { hostname } = window.location;
				if (hostname === "svar.dev" || hostname.endsWith(".svar.dev")) {
					return null;
				}
			}

			const color =
				new Date().getTime() - new Date(2026, 9, 1).getTime() < 0
					? "#bbb"
					: "#fc6519";

			return {
				text: "SVAR Calendar Trial",
				link: "https://svar.dev",
				style: [
					"right:26px",
					"bottom:8px",
					"color:" + color,
					"font-size:12px",
					"font-weight:500",
					"z-index:100001",
					"position:absolute",
					"text-decoration: none",
				].join(";"),
			};
		}
		return null;
	}

	setState(state: Partial<State>, ctx?: TDataConfig) {
		return this._router.setState(state, ctx);
	}
}
