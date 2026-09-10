import { Rest } from "@svar-ui/lib-data-provider";
import type {
	ActionMap,
	RestDataProviderConfig,
} from "@svar-ui/lib-data-provider";
import type {
	CalendarEvent,
	RequestDataAction,
	StoreActions,
} from "@svar-ui/calendar-store";

type TMethodsConfig = Pick<
	StoreActions,
	"add-event" | "update-event" | "move-event" | "delete-event" | "request-data"
>;

export type CalendarRestDataProviderConfig = Partial<RestDataProviderConfig> & {
	loader?: DynamicLoader;
	parseDate?: (v: any) => Date;
	serializeDate?: (date: Date) => any;
};

export type DynamicLoader = {
	request: (data: RequestDataAction) => Promise<void>;
};
export type Range = {
	startDate: Date;
	endDate: Date;
};

export default class RestDataProvider extends Rest<TMethodsConfig> {
	private _loader: DynamicLoader | null = null;
	private _parseDate: (v: any) => Date;
	private _serializeDate: (date: Date) => any;

	constructor(url?: string, config: CalendarRestDataProviderConfig = {}) {
		super(url, config);
		this._loader = config.loader ?? null;
		this._parseDate = config.parseDate || (v => new Date(v));
		this._serializeDate = config.serializeDate || (date => date.toISOString());
	}

	getHandlers(): ActionMap<TMethodsConfig> {
		return {
			"add-event": {
				ignoreID: true,
				handler: async data => {
					const pack = { ...data.event };
					delete pack.id;
					return this.send("events", "POST", pack);
				},
			},
			"update-event": {
				debounce: 500,
				handler: async data => {
					return this.send(`events/${data.id}`, "PUT", data.event);
				},
			},
			"move-event": {
				handler: async data => {
					return this.send(`events/${data.id}`, "PUT", data.event);
				},
			},
			"delete-event": {
				handler: async data => this.send(`events/${data.id}`, "DELETE"),
			},
			"request-data": {
				handler: async data =>
					this.handleDynamicRequest(data as RequestDataAction),
			},
		};
	}

	async getData(range?: Range): Promise<CalendarEvent[]> {
		let events: any;
		if (range) {
			const query = [
				`startDate=${encodeURIComponent(this._serializeDate(range.startDate))}`,
				`endDate=${encodeURIComponent(this._serializeDate(range.endDate))}`,
			].join("&");
			events = await this.send(`events?${query}`, "GET");
		} else {
			events = await this.send("events", "GET");
		}
		return this.parseDates(events);
	}

	parseDates(data: CalendarEvent[]): CalendarEvent[] {
		data.forEach(item => {
			item.start = this._parseDate(item.start as unknown as string);
			item.end = this._parseDate(item.end as unknown as string);
			if (item.exdates) {
				item.exdates = item.exdates.map((d: any) => this._parseDate(d));
			}
		});
		return data;
	}

	protected toPayload(obj: object): string {
		return JSON.stringify(obj, (_key, value) => {
			if (value instanceof Date) {
				return this._serializeDate(value);
			}
			return value;
		});
	}

	private handleDynamicRequest(data: RequestDataAction): Promise<void> | void {
		if (!this._loader) return;
		// fail fast if the dynamic loader has nowhere to dispatch results
		return this._loader.request(data);
	}
}
