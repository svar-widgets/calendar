import type {
	CalendarEvent,
	Scale,
	ScaleUnit,
	ScaleConfig,
	DateScaleConfig,
	TimeScaleConfig,
	UnitScaleConfig,
	FormatFactory,
} from "../../types";

const DAY_MS = 24 * 60 * 60 * 1000;

function midnight(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

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

	getHeaders(): ScaleUnit[][] {
		return [this.units];
	}
}

export class DiscreteScale implements Scale {
	items: { id: string | number; label: string }[];
	accessor: {
		get: (event: CalendarEvent) => string | number;
		set: (
			event: Partial<CalendarEvent>,
			id: string | number
		) => Partial<CalendarEvent>;
	};
	boxSize: number;
	units: ScaleUnit[];

	constructor(
		items: { id: string | number; label: string }[],
		accessor: {
			get: (event: CalendarEvent) => string | number;
			set: (
				event: Partial<CalendarEvent>,
				id: string | number
			) => Partial<CalendarEvent>;
		},
		ui?: Record<string, any>
	) {
		this.items = items;
		this.accessor = accessor;
		this.boxSize = 100 / items.length;
		this.units = items.map((item, i) => ({
			id: item.id,
			label: item.label,
			position: i * this.boxSize,
			size: this.boxSize,
			ui,
		}));
	}

	get count(): number {
		return this.items.length;
	}

	eventToPosition(event: CalendarEvent): { start: number; end: number } {
		const id = this.accessor.get(event);
		const idx = this.items.findIndex(item => item.id === id);
		if (idx === -1) {
			return { start: -1, end: -1 };
		}
		return {
			start: idx * this.boxSize,
			end: (idx + 1) * this.boxSize,
		};
	}

	contains(): boolean {
		return true;
	}

	positionToValue(position: number): string | number {
		const idx = Math.max(
			0,
			Math.min(Math.floor(position / this.boxSize), this.items.length - 1)
		);
		return this.items[idx].id;
	}

	getHeaders(): ScaleUnit[][] {
		return [this.units];
	}
}

function resolveAccessor(
	accessor:
		| string
		| {
				get: (event: CalendarEvent) => string | number;
				set: (
					event: Partial<CalendarEvent>,
					id: string | number
				) => Partial<CalendarEvent>;
		  }
): {
	get: (event: CalendarEvent) => string | number;
	set: (
		event: Partial<CalendarEvent>,
		id: string | number
	) => Partial<CalendarEvent>;
} {
	if (typeof accessor === "string") {
		return {
			get: (event: CalendarEvent) => event[accessor],
			set: (event: Partial<CalendarEvent>, id: string | number) => ({
				...event,
				[accessor]: id,
			}),
		};
	}
	return accessor;
}

export function createScale(
	config: ScaleConfig,
	startDate: Date,
	fmt?: FormatFactory
): Scale {
	switch (config.type) {
		case "date": {
			const c = config as DateScaleConfig;
			const step = c.step ?? 1;
			const rangeStart = midnight(startDate);
			const rangeEnd = new Date(
				rangeStart.getTime() + c.length * step * DAY_MS
			);
			const stepMs = step * DAY_MS;
			const snapStepMs =
				c.snapStep === false ? false : (c.snapStep ?? step) * DAY_MS;
			const format =
				c.format && fmt
					? fmt(c.format)
					: (d: Date) => d.toLocaleDateString("en-US", { weekday: "short" });
			return new LinearScale(
				rangeStart,
				rangeEnd,
				c.length,
				stepMs,
				format,
				c.ui,
				c.discrete,
				snapStepMs
			);
		}
		case "time": {
			const c = config as TimeScaleConfig;
			if (c.segments) {
				throw new Error("SegmentedScale not implemented");
			}
			const startHour = c.startHour ?? 0;
			const endHour = c.endHour ?? 24;
			const stepMin = c.step ?? 60;
			const rangeStart = new Date(startDate);
			rangeStart.setHours(startHour, 0, 0, 0);
			const rangeEnd = new Date(startDate);
			rangeEnd.setHours(endHour, 0, 0, 0);
			const stepMs = stepMin * 60 * 1000;
			const snapStepMs =
				c.snapStep === false ? false : (c.snapStep ?? stepMin) * 60 * 1000;
			const unitCount = ((endHour - startHour) * 60) / stepMin;
			const format =
				c.format && fmt
					? fmt(c.format)
					: (d: Date) =>
							d.toLocaleTimeString("en-US", {
								hour: "2-digit",
								minute: "2-digit",
							});
			return new LinearScale(
				rangeStart,
				rangeEnd,
				unitCount,
				stepMs,
				format,
				c.ui,
				undefined,
				snapStepMs
			);
		}
		case "unit": {
			const c = config as UnitScaleConfig;
			return new DiscreteScale(c.items, resolveAccessor(c.accessor), c.ui);
		}
		case "combined":
		case "stacked":
			throw new Error(`${config.type} scale not implemented`);
		default:
			throw new Error(`Unknown scale type`);
	}
}
