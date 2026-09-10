import type {
	CalendarEvent,
	Scale,
	ScaleConfig,
	DateScaleConfig,
	TimeScaleConfig,
	UnitScaleConfig,
	CombinedScaleConfig,
	FormatFactory,
} from "../../types";
import { LinearScale } from "./linear_scale";
import { DiscreteScale } from "./discrete_scale";
import { CombinedScale } from "./combined_scale";

export { LinearScale } from "./linear_scale";
export { DiscreteScale } from "./discrete_scale";
export { CombinedScale } from "./combined_scale";

export const DAY_MS = 24 * 60 * 60 * 1000;

function midnight(date: Date): Date {
	const d = new Date(date);
	d.setHours(0, 0, 0, 0);
	return d;
}

function resolveAccessor(
	accessor:
		| string
		| {
				get: (event: CalendarEvent) => string | number | (string | number)[];
				set: (
					event: Partial<CalendarEvent>,
					id: string | number
				) => Partial<CalendarEvent>;
		  }
): {
	get: (event: CalendarEvent) => string | number | (string | number)[];
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

function countMultipleScales(config: ScaleConfig): number {
	if (config.type === "unit") return config.multiple ? 1 : 0;
	if (config.type === "combined") {
		return (
			countMultipleScales(config.outer) + countMultipleScales(config.inner)
		);
	}
	if (config.type === "stacked") {
		return config.levels.reduce(
			(count, level) => count + countMultipleScales(level),
			0
		);
	}
	return 0;
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
			return new DiscreteScale(
				c.items,
				resolveAccessor(c.accessor),
				c.ui,
				c.multiple
			);
		}
		case "combined": {
			const c = config as CombinedScaleConfig;
			if (countMultipleScales(c) > 1) {
				throw new Error(
					"CombinedScale supports at most one unit scale with multiple: true"
				);
			}
			const outer = createScale(c.outer, startDate, fmt);
			const inner = createScale(c.inner, startDate, fmt);
			if (outer.count === 0 || inner.count === 0) {
				throw new Error(
					"CombinedScale requires non-empty outer and inner scales"
				);
			}
			return new CombinedScale(outer, inner);
		}
		case "stacked":
			throw new Error(`${config.type} scale not implemented`);
		default:
			throw new Error(`Unknown scale type`);
	}
}
