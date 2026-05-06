import pkg from "../package.json";

export type {
	CalendarEvent,
	EventID,
	ScaleUnit,
	Scale,
	ScaleConfig,
	DateScaleConfig,
	TimeScaleConfig,
	UnitScaleConfig,
	CombinedScaleConfig,
	StackedScaleConfig,
	SectionMode,
	Primitive,
	GridCell,
	Section,
	SectionResult,
	CellContext,
	EventContext,
	EventContentMode,
	CellCss,
	EventCss,
	IEventStore,
	FormatFactory,
	State,
	StoreActions,
	Brandmark,
} from "./types";

export { EventsStore } from "./events_store";
export {
	LinearScale,
	DiscreteScale,
	createScale,
} from "./models/helpers/scales";
export { layoutBars, layoutBoxes } from "./models/helpers/layout";
export { isMultiDay } from "./models/helpers/filters";
export { ViewModel } from "./models/model";
export { WeekViewModel } from "./models/week_view";
export { DayViewModel } from "./models/day_view";
export { MonthViewModel } from "./models/month_view";
export type { ViewConfig } from "./registry";
export { getMenuOptions, getToolbarItems } from "./constants";
export type { ToolbarItem } from "./constants";
export { CalendarStore } from "./calendar_store";
export { registerCalendarView } from "./registry";

export const version = pkg.version;

