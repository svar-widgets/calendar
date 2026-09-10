import type {
	CalendarEvent,
	Scale,
	ScaleUnit,
	ScaleSegment,
} from "../../types";
import { DAY_MS } from "./scales";

export class LinearScale implements Scale {
	rangeStart: Date;
	rangeEnd: Date;
	stepMs: number;
	snapStepMs: number | false;
	unitCount: number;
	units: ScaleUnit[];
	discrete: boolean;

	constructor(
		rangeStart: Date,
		rangeEnd: Date,
		unitCount: number,
		stepMs: number,
		format: (date: Date) => string,
		ui?: Record<string, any>,
		discrete?: boolean,
		snapStepMs?: number | false
	) {
		this.rangeStart = rangeStart;
		this.rangeEnd = rangeEnd;
		this.unitCount = unitCount;
		this.stepMs = stepMs;
		this.snapStepMs = snapStepMs ?? stepMs;
		this.discrete = discrete ?? false;

		const size = 100 / unitCount;
		this.units = [];
		const stepDays = stepMs >= DAY_MS ? Math.round(stepMs / DAY_MS) : 0;
		const markWeekend = stepMs === DAY_MS && unitCount > 1;
		for (let i = 0; i < unitCount; i++) {
			let unitStart: Date;
			if (stepDays > 0) {
				unitStart = new Date(rangeStart);
				unitStart.setDate(unitStart.getDate() + i * stepDays);
			} else {
				unitStart = new Date(rangeStart.getTime() + i * stepMs);
			}
			const unit: ScaleUnit = {
				id: this.formatId(unitStart),
				label: format(unitStart),
				position: i * size,
				size,
				ui: { ...ui, date: unitStart },
			};
			if (markWeekend) {
				const dow = unitStart.getDay();
				unit.weekend = dow === 0 || dow === 6;
			}
			this.units.push(unit);
		}
	}

	private formatId(date: Date): string {
		if (this.stepMs >= DAY_MS) {
			return date.toISOString().slice(0, 10);
		}
		const h = String(date.getHours()).padStart(2, "0");
		const m = String(date.getMinutes()).padStart(2, "0");
		return `${h}:${m}`;
	}

	get count(): number {
		return this.unitCount;
	}

	eventToPosition(event: CalendarEvent): { start: number; end: number } {
		const range = this.rangeEnd.getTime() - this.rangeStart.getTime();
		return {
			start:
				((event.start.getTime() - this.rangeStart.getTime()) / range) * 100,
			end: ((event.end.getTime() - this.rangeStart.getTime()) / range) * 100,
		};
	}

	contains(date: Date): boolean {
		return date >= this.rangeStart && date < this.rangeEnd;
	}

	positionToValue(position: number): Date {
		if (this.discrete) {
			const unitSize = 100 / this.unitCount;
			const raw = position / unitSize;
			const idx = Math.max(
				0,
				Math.min(Math.floor(raw + 1e-9), this.unitCount - 1)
			);
			return new Date(this.rangeStart.getTime() + idx * this.stepMs);
		}
		const range = this.rangeEnd.getTime() - this.rangeStart.getTime();
		return new Date(this.rangeStart.getTime() + (position / 100) * range);
	}

	segmentEvent(event: CalendarEvent): ScaleSegment[] {
		const segments: ScaleSegment[] = [];
		const units = this.units;

		// Find the starting unit: walk until a unit begins after event.start,
		// its predecessor (i - 1) is the unit containing the event start.
		let i = 0;
		while (i < units.length && (units[i].ui!.date as Date) <= event.start) i++;
		if (i > 0) i--;

		// Walk forward, clipping the event to each unit, until we pass event.end.
		for (; i < units.length; i++) {
			const start = units[i].ui!.date as Date;
			if (start >= event.end) break;
			const next = units[i + 1];
			const end = next ? (next.ui!.date as Date) : this.rangeEnd;
			const chunkStart = event.start > start ? event.start : start;
			const chunkEnd = event.end < end ? event.end : end;
			if (chunkEnd > chunkStart) {
				segments.push({
					start: new Date(chunkStart),
					end: new Date(chunkEnd),
					unitIndex: i,
				});
			}
		}
		return segments;
	}

	getUnitStart(unitIndex: number): Date | null {
		const unit = this.units[unitIndex];
		return unit?.ui?.date instanceof Date ? new Date(unit.ui.date) : null;
	}

	applyPosition(
		position: number,
		target: "start" | "end",
		event?: Partial<CalendarEvent>,
		snap?: boolean
	): Partial<CalendarEvent> {
		let value = this.positionToValue(position);
		if (snap && this.snapStepMs !== false) {
			const base = this.rangeStart.getTime();
			value = new Date(
				base +
					Math.round((value.getTime() - base) / this.snapStepMs) *
						this.snapStepMs
			);
		}

		if (this.stepMs >= DAY_MS) {
			const source = event?.[target];
			if (source instanceof Date) {
				value.setHours(
					source.getHours(),
					source.getMinutes(),
					source.getSeconds(),
					source.getMilliseconds()
				);
			}
		}

		return { ...event, [target]: value };
	}

	getHeaders(): ScaleUnit[][] {
		return [this.units];
	}
}
