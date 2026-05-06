import { Rest } from "@svar-ui/lib-data-provider";
import type { ActionMap } from "@svar-ui/lib-data-provider";
import type { CalendarEvent, StoreActions } from "@svar-ui/calendar-store";

type TMethodsConfig = Pick<
	StoreActions,
	"add-event" | "update-event" | "delete-event"
>;

export default class RestDataProvider extends Rest<TMethodsConfig> {
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
			"delete-event": {
				handler: async data => this.send(`events/${data.id}`, "DELETE"),
			},
		};
	}

	async getData(): Promise<CalendarEvent[]> {
		const events: any = await this.send("events", "GET");
		return this.parseDates(events);
	}

	parseDates(data: CalendarEvent[]): CalendarEvent[] {
		data.forEach(item => {
			item.start = new Date(item.start as unknown as string);
			item.end = new Date(item.end as unknown as string);
			if (item.exdates) {
				item.exdates = item.exdates.map((d: any) => new Date(d));
			}
		});
		return data;
	}

	protected toPayload(obj: object): string {
		return JSON.stringify(obj, (_key, value) => {
			if (value instanceof Date) {
				return this.formatDate(value);
			}
			return value;
		});
	}

	formatDate(date: Date): string {
		return date.toISOString();
	}
}
