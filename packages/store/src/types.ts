import { ViewModel } from "./models/model";
import type { Store } from "@svar-ui/lib-state";
import type { EventsStore } from "./events_store";

export type Brandmark = {
	text: string;
	link?: string;
	style: string;
};

export type State = {
	currentDate: Date;
	currentView: string;
	rangeLabel: string;
	visibleDateRange: { start: Date; end: Date };

	events: EventsStore;
	viewData: any;
	filters: Map<string, (obj: any) => boolean>;

	editorData: CalendarEvent | null;

	_view: ViewModel;
};

export interface StoreActions {
	["navigate-to"]: {
		date?: Date;
		view?: string;
	};
	["navigate-time"]: {
		direction: "next" | "previous" | "now";
	};
	["add-event"]: {
		event: Partial<CalendarEvent>;
		edit?: boolean;
		id?: EventID;
	};
	["update-event"]: {
		id: EventID;
		event: Partial<CalendarEvent>;
		mode?: "single" | "following";
		originalDate?: string;
	};
	["delete-event"]: {
		id: EventID;
	};
	["select-event"]: {
		id: EventID | null;
	};
	["move-event"]: {
		id: EventID;
		x: number;
		y: number;
	};
	["filter-events"]: {
		filter?: ((obj: any) => boolean) | null;
		tag?: string;
	};
}

export type TDispatch = <A extends keyof StoreActions>(
	action: A,
	data: StoreActions[A]
) => void;

export type TActions = keyof StoreActions;

export interface ICalendarStore extends Store<State> {
	getView(name: string): ViewModel;
	getEvents(start?: Date, end?: Date): CalendarEvent[];
	getBrandmark(): Brandmark | null;
}

export type EventID = string | number;

export interface CalendarEvent {
	id: EventID;
	start: Date;
	end: Date;
	allDay?: boolean;
	[key: string]: any;
}

export interface ScaleUnit {
	id: string | number;
	label: string;
	position: number;
	size: number;
	weekend?: boolean;
	ui?: Record<string, any>;
}

export interface Scale {
	units: ScaleUnit[];
	eventToPosition(event: CalendarEvent): { start: number; end: number };
	contains(date: Date): boolean;
	readonly count: number;
	getHeaders(): ScaleUnit[][];
	positionToValue(position: number): Date | string | number;
}

export interface DateScaleConfig {
	type: "date";
	length: number;
	step?: number;
	snapStep?: number | false;
	discrete?: boolean;
	visible?: boolean;
	format?: string;
	ui?: Record<string, any>;
}

export interface TimeScaleConfig {
	type: "time";
	startHour?: number;
	endHour?: number;
	step?: number;
	snapStep?: number | false;
	segments?: {
		start: string;
		end: string;
		size?: number;
		label?: string;
		ui?: Record<string, any>;
	}[];
	visible?: boolean;
	format?: string;
	ui?: Record<string, any>;
}

export type FormatFactory = (pattern: string) => (date: Date) => string;

export interface UnitScaleConfig {
	type: "unit";
	items: { id: string | number; label: string }[];
	accessor:
		| string
		| {
				get: (event: CalendarEvent) => string | number;
				set: (
					event: Partial<CalendarEvent>,
					id: string | number
				) => Partial<CalendarEvent>;
		  };
	visible?: boolean;
	ui?: Record<string, any>;
}

export interface CombinedScaleConfig {
	type: "combined";
	outer: ScaleConfig;
	inner: ScaleConfig;
	visible?: boolean;
}

export interface StackedScaleConfig {
	type: "stacked";
	levels: ScaleConfig[];
	visible?: boolean;
}

export type ScaleConfig =
	| DateScaleConfig
	| TimeScaleConfig
	| UnitScaleConfig
	| CombinedScaleConfig
	| StackedScaleConfig;

export interface Primitive {
	id: EventID;
	event: CalendarEvent;
	x: number;
	y: number;
	width: number;
	height: number;
	isMultiDay?: boolean;
	lane?: number;
	totalLanes?: number;
	slot?: number;
	maxConcurrency?: number;
}

export interface GridCell {
	date: Date;
	day: number;
	inMonth: boolean;
	today: boolean;
	weekend: boolean;
	x: number;
	y: number;
	width: number;
	height: number;
}

export type SectionMode = "bars" | "boxes" | "grid" | "list" | "year";
export type BoxLayoutMode = "split" | "overlap";

export interface Section {
	name: string;
	mode: SectionMode;
	xScale: ScaleConfig;
	yScale: ScaleConfig;
	primaryScale?: "x" | "y";
	boxLayout?: BoxLayoutMode;
	filter?: (event: CalendarEvent) => boolean;
	size?: number | "content" | "content-optional";
	ui?: Record<string, any>;
}

export interface SectionResult {
	name: string;
	mode: SectionMode;
	size: number | "content" | "content-optional";
	primitives: Primitive[];
	xHeaders: ScaleUnit[][] | null;
	yHeaders: ScaleUnit[][] | null;
	xVisible?: boolean;
	yVisible?: boolean;
	cells?: GridCell[];
	ui?: Record<string, any>;
}

export interface CellContext {
	view: string;
	section: string;
	mode: SectionMode;
	x: ScaleUnit | null;
	y: ScaleUnit | null;
	date: Date | null;
}

export interface EventContext {
	event: CalendarEvent;
	view: string;
	section: string;
	mode: SectionMode;
}

export type EventContentMode =
	| "grid"
	| "bars"
	| "boxes"
	| "list"
	| "year-tooltip";

export type CellCss = (ctx: CellContext) => string;
export type EventCss = (ctx: EventContext) => string;

export interface IEventStore {
	addEvent(event: Partial<CalendarEvent>): CalendarEvent;
	updateEvent(
		id: EventID,
		updates: Partial<CalendarEvent>,
		mode?: "single" | "following",
		originalDate?: string
	): CalendarEvent | null;
	removeEvent(id: EventID): boolean;
	getEvent(id: EventID): CalendarEvent | undefined;
	getEvents(start?: Date, end?: Date): CalendarEvent[];
	clear(): void;
	getCount(): number;
}
