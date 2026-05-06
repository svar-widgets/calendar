import type { CalendarEvent, Section } from "../types";
import { ViewModel } from "./model";
import { isMultiDay } from "./helpers/filters";

export class WeekViewModel extends ViewModel {
	getSections(): Section[] {
		return [
			{
				name: "multiday",
				mode: "bars",
				xScale: { type: "date", length: 7, format: "weekScaleFormat" },
				yScale: {
					type: "unit",
					items: [{ id: "all", label: "" }],
					accessor: "_",
					visible: false,
				},
				filter: (event: CalendarEvent) => isMultiDay(event),
				size: "content-optional",
				ui: { clipDrag: false },
			},
			{
				name: "timeGrid",
				mode: "boxes",
				xScale: { type: "date", length: 7, format: "weekScaleFormat" },
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
		const start = this.startDate;
		const end = new Date(this.endDate.getTime() - 1);
		return `${this.fmt("titleWeekFormatStart")(start)}–${this.fmt("titleWeekFormatEnd")(end)}`;
	}

	rangeStart(date: Date): Date {
		const d = new Date(date);
		d.setHours(0, 0, 0, 0);
		const diff = (((d.getDay() - this.weekStartDay) % 7) + 7) % 7;
		d.setDate(d.getDate() - diff);
		return d;
	}

	addRange(date: Date, n: number): Date {
		const d = new Date(date);
		d.setDate(d.getDate() + n * 7);
		return d;
	}
}
