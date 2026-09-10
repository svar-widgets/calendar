import type {
	CalendarEvent,
	Scale,
	ScaleUnit,
	ScaleSegment,
} from "../../types";

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
	multiple: boolean;
	private readValue: (
		event: CalendarEvent
	) => string | number | (string | number)[];

	constructor(
		items: { id: string | number; label: string }[],
		accessor: {
			get: (event: CalendarEvent) => string | number | (string | number)[];
			set: (
				event: Partial<CalendarEvent>,
				id: string | number
			) => Partial<CalendarEvent>;
		},
		ui?: Record<string, any>,
		multiple?: boolean
	) {
		this.items = items;
		this.multiple = multiple ?? false;
		this.readValue = accessor.get;
		this.accessor = {
			...accessor,
			get: event => {
				const value = accessor.get(event);
				return Array.isArray(value) ? value[0] : value;
			},
		};
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

	segmentEvent(event: CalendarEvent): ScaleSegment[] {
		if (!this.multiple && this.items.length === 1) {
			return [{ start: event.start, end: event.end, unitIndex: 0 }];
		}
		const raw = this.readValue(event);
		if (!raw) return [];

		const values = Array.isArray(raw) ? raw : [raw];

		return values
			.map(value => this.items.findIndex(item => item.id === value))
			.filter(index => index !== -1)
			.map(unitIndex => ({
				start: event.start,
				end: event.end,
				unitIndex,
				...(this.multiple ? { sourceUnitId: this.items[unitIndex].id } : {}),
			}));
	}

	getUnitStart(): Date | null {
		return null;
	}

	applyPosition(
		position: number,
		_target: "start" | "end",
		event?: Partial<CalendarEvent>
	): Partial<CalendarEvent> {
		return this.accessor.set(event ?? {}, this.positionToValue(position));
	}

	getHeaders(): ScaleUnit[][] {
		return [this.units];
	}
}
