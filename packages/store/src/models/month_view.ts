import type {
	CalendarEvent,
	Scale,
	Section,
	Primitive,
	GridCell,
} from "../types";
import { ViewModel, type EventChunk } from "./model";

export class MonthViewModel extends ViewModel {
	snapToCell = false;
	getSections(): Section[] {
		const weekCount = this.getWeekCount();
		return [
			{
				name: "month",
				mode: "grid",
				xScale: {
					type: "date",
					length: 7,
					discrete: true,
					format: "monthScaleFormat",
				},
				yScale: {
					type: "date",
					length: weekCount,
					step: 7,
					discrete: true,
					visible: false,
				},
				size: 1,
				ui: { clipDrag: false },
			},
		];
	}

	getRangeLabel(): string {
		const target = this.getTargetMonth(this.startDate);
		return this.fmt("titleMonthFormat")(target);
	}

	setRange(date: Date): [Date, Date] {
		this.startDate = this.rangeStart(date);
		const weekCount = this.getWeekCount();
		this.endDate = new Date(this.startDate);
		this.endDate.setDate(this.endDate.getDate() + weekCount * 7);
		return [this.startDate, this.endDate];
	}

	rangeStart(date: Date): Date {
		// 1. First day of the month
		const first = new Date(date);
		first.setDate(1);
		first.setHours(0, 0, 0, 0);

		// 2. weekStartDay of that week
		const diff = (((first.getDay() - this.weekStartDay) % 7) + 7) % 7;
		first.setDate(first.getDate() - diff);
		return first;
	}

	addRange(date: Date, n: number): Date {
		// Return a date IN the target month (not grid-aligned),
		// because setRange/rangeStart will handle grid alignment.
		// Using the 1st avoids edge cases with day overflow (e.g. Jan 31 + 1 month).
		const d = new Date(date);
		d.setDate(1);
		d.setMonth(d.getMonth() + n);
		return d;
	}

	protected sortBeforeLayout(primitives: Primitive[], _mode: string): void {
		primitives.sort((a, b) => {
			const dx = a.x - b.x;
			if (dx !== 0) return dx;
			const aMulti = a.isMultiDay ? 0 : 1;
			const bMulti = b.isMultiDay ? 0 : 1;
			return aMulti - bMulti;
		});
	}

	protected mapToPrimitive(
		chunk: EventChunk,
		primaryUnit: { position: number; size: number },
		secondaryScale: Scale,
		primaryAxis: "x" | "y"
	): Primitive | null {
		const prim = super.mapToPrimitive(
			chunk,
			primaryUnit,
			secondaryScale,
			primaryAxis
		);
		if (!prim) return null;

		const isMultiDay =
			chunk.event.allDay || !isSameDay(chunk.event.start, chunk.event.end);
		prim.isMultiDay = isMultiDay;

		// Snap events to day cell boundaries
		if (!isMultiDay || this.snapToCell) {
			const startUnitIdx = this.findUnitIndex(secondaryScale, {
				...chunk.event,
				start: chunk.start,
				end: chunk.end,
			} as CalendarEvent);
			if (startUnitIdx === -1) return null;
			const startUnit = secondaryScale.units[startUnitIdx];

			let endUnit = startUnit;
			if (isMultiDay) {
				const endDate = new Date(chunk.end.getTime() - 1);
				const endUnitIdx = this.findUnitIndex(secondaryScale, {
					...chunk.event,
					start: endDate,
					end: endDate,
				} as CalendarEvent);
				if (endUnitIdx !== -1) {
					endUnit = secondaryScale.units[endUnitIdx];
				}
			}

			if (primaryAxis === "x") {
				prim.y = startUnit.position;
				prim.height = endUnit.position + endUnit.size - startUnit.position;
			} else {
				prim.x = startUnit.position;
				prim.width = endUnit.position + endUnit.size - startUnit.position;
			}
		}

		return prim;
	}

	protected buildCells(xScale: Scale, yScale: Scale): GridCell[] {
		const targetMonth = this.getTargetMonth(this.startDate).getMonth();
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const todayTime = today.getTime();

		const cells: GridCell[] = [];
		const xUnits = xScale.units;
		const yUnits = yScale.units;

		for (let row = 0; row < yUnits.length; row++) {
			for (let col = 0; col < xUnits.length; col++) {
				const date = new Date(this.startDate);
				date.setDate(date.getDate() + row * 7 + col);
				date.setHours(0, 0, 0, 0);

				const dow = date.getDay();
				cells.push({
					date,
					day: date.getDate(),
					inMonth: date.getMonth() === targetMonth,
					today: date.getTime() === todayTime,
					weekend: dow === 0 || dow === 6,
					x: xUnits[col].position,
					y: yUnits[row].position,
					width: xUnits[col].size,
					height: yUnits[row].size,
				});
			}
		}

		return cells;
	}

	private getTargetMonth(date: Date): Date {
		const d = new Date(date);
		d.setDate(d.getDate() + 7);
		return new Date(d.getFullYear(), d.getMonth(), 1);
	}

	private getWeekCount(): number {
		const target = this.getTargetMonth(this.startDate);
		const lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0);
		lastDay.setHours(0, 0, 0, 0);

		// Find next weekStartDay strictly after lastDay
		const dow = lastDay.getDay();
		const daysUntilNextStart = (((this.weekStartDay - dow) % 7) + 7) % 7 || 7;
		const gridEnd = new Date(lastDay);
		gridEnd.setDate(gridEnd.getDate() + daysUntilNextStart);

		const diffMs = gridEnd.getTime() - this.startDate.getTime();
		const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
		return days / 7;
	}
}

function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}
