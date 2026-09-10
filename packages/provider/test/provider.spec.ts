import { describe, expect, it } from "vite-plus/test";
import { RestDataProvider } from "../src/index";
import type { RequestDataAction } from "../src/index";
import type { CalendarEvent } from "@svar-ui/calendar-store";

function getDataStore() {
	const provider = new RestDataProvider("");
	return { provider };
}

type Request = {
	url: string;
	method: string;
	data?: object;
};

class TestProvider extends RestDataProvider {
	requests: Request[] = [];
	responses: (CalendarEvent[] | Promise<CalendarEvent[]>)[] = [];

	async send(url: string, method: string, data?: object): Promise<any> {
		this.requests.push({ url, method, data });
		return this.responses.shift() ?? [];
	}
}

function range(
	startDate = new Date("2026-04-01T00:00:00.000Z"),
	endDate = new Date("2026-04-08T00:00:00.000Z")
): RequestDataAction {
	return {
		startDate,
		endDate,
		date: startDate,
		view: "week",
	};
}

function event(id: number, text = `event ${id}`): CalendarEvent {
	return {
		id,
		text,
		start: "2026-04-02T10:00:00.000Z",
		end: "2026-04-02T11:00:00.000Z",
	} as any;
}

function queryParam(url: string, key: string): string | null {
	const query = url.split("?")[1];
	const part = query?.split("&").find(item => item.startsWith(`${key}=`));
	if (!part) return null;
	return decodeURIComponent(part.slice(key.length + 1));
}

describe("data provider", function () {
	it("can be initialized", () => {
		const t = getDataStore();
		expect(t).not.eq(null);
	});

	it("sends move-event through the update route", async () => {
		const provider = new TestProvider("");
		const update = {
			start: new Date("2026-04-02T12:00:00.000Z"),
			end: new Date("2026-04-02T13:00:00.000Z"),
			assignee: ["alice", "bob"],
		};

		await provider.exec("move-event", {
			id: 7,
			rawId: "7##:charlie#",
			event: update,
		});

		expect(provider.requests).toHaveLength(1);
		expect(provider.requests[0]).toEqual({
			url: "events/7",
			method: "PUT",
			data: update,
		});
	});

	it("fetches events for a requested range and parses dates", async () => {
		const provider = new TestProvider("");
		provider.responses.push([event(1)]);

		const request = range();
		const events = await provider.getData(request);

		expect(provider.requests).toHaveLength(1);
		expect(provider.requests[0].method).toBe("GET");
		expect(queryParam(provider.requests[0].url, "startDate")).toBe(
			request.startDate.toISOString()
		);
		expect(queryParam(provider.requests[0].url, "endDate")).toBe(
			request.endDate.toISOString()
		);
		expect(events).toHaveLength(1);
		expect(events[0].start).toBeInstanceOf(Date);
	});

	it("delegates request-data to the configured loader", async () => {
		const requested: RequestDataAction[] = [];
		const provider = new TestProvider("", {
			loader: {
				request: async data => {
					requested.push(data);
				},
			},
		});

		const request = range();
		await provider.exec("request-data", request);

		expect(requested).toHaveLength(1);
		expect(requested[0].startDate.toISOString()).toBe(
			request.startDate.toISOString()
		);
		expect(requested[0].endDate.toISOString()).toBe(
			request.endDate.toISOString()
		);
		// the loader owns fetching, the provider issues no request itself
		expect(provider.requests).toHaveLength(0);
	});

	it("uses a custom parseDate when reading events", async () => {
		const parsed = new Date("2000-01-01T00:00:00.000Z");
		const provider = new TestProvider("", {
			parseDate: () => parsed,
		});
		provider.responses.push([event(1)]);

		const events = await provider.getData();

		expect(events[0].start).toBe(parsed);
		expect(events[0].end).toBe(parsed);
	});

	it("uses a custom serializeDate when building the range query", async () => {
		const provider = new TestProvider("", {
			serializeDate: () => "SERIALIZED",
		});
		provider.responses.push([]);

		await provider.getData(range());

		expect(queryParam(provider.requests[0].url, "startDate")).toBe(
			"SERIALIZED"
		);
		expect(queryParam(provider.requests[0].url, "endDate")).toBe("SERIALIZED");
	});
});
