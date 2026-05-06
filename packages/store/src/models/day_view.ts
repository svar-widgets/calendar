import type { CalendarEvent, Section } from "../types";
import { ViewModel } from "./model";
import { isMultiDay } from "./helpers/filters";

export class DayViewModel extends ViewModel {
	getSections(): Section[] {
		return [
			{
				name: "multiday",
				mode: "bars",
				xScale: { type: "date", length: 1, visible: false },
				yScale: {
					type: "unit",
					items: [{ id: "all", label: "" }],
					accessor: "_",
					visible: false,
				},
				filter: (event: CalendarEvent) => isMultiDay(event),
				size: "content-optional",
				ui: {
					drag: false,
					dragCreate: false,
				},
			},
			{
				name: "timeGrid",
				mode: "boxes",
				xScale: { type: "date", length: 1, visible: false },
				yScale: {
					type: "time",
					startHour: 8,
					endHour: 18,
					step: 60,
					snapStep: 15,
					ui: { minUnitHeight: 100 },
					format: "timeScaleFormat",
				},
				filter: (event: CalendarEvent) => !isMultiDay(event),
				size: 1,
			},
		];
	}

	getRangeLabel(): string {
		return this.fmt("titleDayFormat")(this.startDate);
	}

	rangeStart(date: Date): Date {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		return d;
	}

	addRange(date: Date, n: number): Date {
		const d = new Date(date);
		d.setDate(d.getDate() + n);
		return d;
	}
}
