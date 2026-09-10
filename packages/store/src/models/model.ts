import type {
	CalendarEvent,
	Scale,
	Section,
	SectionResult,
	Primitive,
	EventID,
	GridCell,
	FormatFactory,
	ProjectedEvent,
} from "../types";
import { createScale } from "./helpers/scales";
import { layoutBars, layoutBoxes } from "./helpers/layout";
import { encodeId } from "../helpers/ids";

export interface EventChunk {
	id: EventID;
	event: CalendarEvent;
	start: Date;
	end: Date;
	unitIndex?: number;
}

interface CachedSection {
	section: Section;
	primaryScale: Scale;
	secondaryScales: Map<number, Scale>;
	xHeaders: SectionResult["xHeaders"];
	yHeaders: SectionResult["yHeaders"];
	cells?: GridCell[];
}

export abstract class ViewModel {
	render?: string;
	weekStartDay: number = 1; // 0=Sun, 1=Mon, ..., 6=Sat
	fmt: FormatFactory = () => (d: Date) => d.toLocaleDateString();
	protected startDate!: Date;
	protected endDate!: Date;
	private cachedSections: CachedSection[] = [];
	private _sectionOverrides?: Record<string, any>;

	configure(sections: Record<string, any>): void {
		this._sectionOverrides = sections;
	}

	abstract getSections(): Section[];
	abstract rangeStart(date: Date): Date;
	abstract addRange(date: Date, n: number): Date;
	abstract getRangeLabel(): string;

	setRange(date: Date): [Date, Date] {
		this.startDate = this.rangeStart(date);
		this.endDate = this.addRange(this.startDate, 1);
		return [this.startDate, this.endDate];
	}

	process(events: CalendarEvent[]): SectionResult[] {
		let sections = this.getSections();
		if (this._sectionOverrides) {
			sections = sections.map(s => {
				const ov = this._sectionOverrides![s.name];
				return ov ? deepMerge(s, ov) : s;
			});
		}

		this.cachedSections = [];
		const results: SectionResult[] = [];

		for (const section of sections) {
			const result = this.processSection(section, events, true);
			results.push(result);
		}

		return results;
	}

	projectEvent(event: Partial<CalendarEvent>): ProjectedEvent[] {
		if (
			!(event.start instanceof Date) ||
			!(event.end instanceof Date) ||
			event.end <= event.start
		) {
			return [];
		}

		const full = {
			...event,
			id: event.id ?? "$event-placeholder",
		} as CalendarEvent;
		const projections: ProjectedEvent[] = [];

		for (const cached of this.cachedSections) {
			const { section, primaryScale, secondaryScales } = cached;
			if (section.filter && !section.filter(full)) continue;

			const primaryAxis = this.getPrimaryAxis(section);
			const secondaryConfig =
				primaryAxis === "x" ? section.yScale : section.xScale;
			const primitives: Primitive[] = [];
			const segments = primaryScale.segmentEvent(full);

			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				const contextual =
					segments.length > 1 || segment.sourceUnitId !== undefined;
				const chunk: EventChunk = {
					id: contextual
						? encodeId(full.id, {
								index: segments.length > 1 ? i : undefined,
								unitId: segment.sourceUnitId,
							})
						: full.id,
					event: full,
					start: segment.start,
					end: segment.end,
					unitIndex: segment.unitIndex,
				};

				const unitIdx =
					chunk.unitIndex ?? this.findUnitIndex(primaryScale, full);
				const unit = primaryScale.units[unitIdx];
				if (!unit) continue;

				let secondaryScale = secondaryScales.get(unitIdx);
				if (!secondaryScale) {
					const groupStart =
						primaryScale.getUnitStart(unitIdx) ?? this.startDate;
					secondaryScale = createScale(secondaryConfig, groupStart, this.fmt);
					secondaryScales.set(unitIdx, secondaryScale);
				}

				const primitive = this.mapToPrimitive(
					chunk,
					unit,
					secondaryScale,
					primaryAxis
				);
				if (primitive) primitives.push(primitive);
			}

			if (primitives.length) {
				projections.push({
					section: section.name,
					mode: section.mode,
					primitives,
				});
			}
		}

		return projections;
	}

	toPositionStart(
		sectionName: string,
		x: number,
		y: number,
		ev?: Partial<CalendarEvent>,
		snap?: boolean
	): Partial<CalendarEvent> {
		return this.resolvePosition(sectionName, x, y, "start", ev, snap);
	}

	toPositionEnd(
		sectionName: string,
		x: number,
		y: number,
		ev?: Partial<CalendarEvent>,
		snap?: boolean
	): Partial<CalendarEvent> {
		return this.resolvePosition(sectionName, x, y, "end", ev, snap);
	}

	private resolvePosition(
		sectionName: string,
		x: number,
		y: number,
		target: "start" | "end",
		ev?: Partial<CalendarEvent>,
		snap?: boolean
	): Partial<CalendarEvent> {
		const cached = this.cachedSections.find(
			c => c.section.name === sectionName
		);
		if (!cached) return ev ? { ...ev } : {};

		const { section } = cached;
		const primaryAxis = this.getPrimaryAxis(section);
		const primaryPos = primaryAxis === "x" ? x : y;
		const secondaryPos = primaryAxis === "x" ? y : x;

		const unitIdx = this.findUnitForPosition(cached.primaryScale, primaryPos);

		let secScale = cached.secondaryScales.get(unitIdx);
		if (!secScale) {
			const secondaryConfig =
				primaryAxis === "x" ? section.yScale : section.xScale;
			const groupStart =
				cached.primaryScale.getUnitStart(unitIdx) ?? this.startDate;
			secScale = createScale(secondaryConfig, groupStart, this.fmt);
			cached.secondaryScales.set(unitIdx, secScale);
		}

		let result: Partial<CalendarEvent> = ev ? { ...ev } : {};
		Object.assign(
			result,
			cached.primaryScale.applyPosition(primaryPos, target, result, snap)
		);
		Object.assign(
			result,
			secScale.applyPosition(secondaryPos, target, result, snap)
		);

		return result;
	}

	private processSection(
		section: Section,
		events: CalendarEvent[],
		doLayout: boolean
	): SectionResult {
		const primaryAxis = this.getPrimaryAxis(section);
		const primaryConfig = primaryAxis === "x" ? section.xScale : section.yScale;
		const secondaryConfig =
			primaryAxis === "x" ? section.yScale : section.xScale;

		const primaryScale = createScale(primaryConfig, this.startDate, this.fmt);

		// Filter
		const filtered = section.filter ? events.filter(section.filter) : events;

		// Split and expand through the primary scale's operational units
		const allChunks: EventChunk[] = [];
		for (const event of filtered) {
			const segments = primaryScale.segmentEvent(event);
			for (let i = 0; i < segments.length; i++) {
				const segment = segments[i];
				const contextual =
					segments.length > 1 || segment.sourceUnitId !== undefined;
				allChunks.push({
					id: contextual
						? encodeId(event.id, {
								index: segments.length > 1 ? i : undefined,
								unitId: segment.sourceUnitId,
							})
						: event.id,
					event,
					start: segment.start,
					end: segment.end,
					unitIndex: segment.unitIndex,
				});
			}
		}

		// Place + Layout per primary-scale group
		const secondaryScales = new Map<number, Scale>();
		const allPrimitives: Primitive[] = [];

		// Group chunks by primary scale unit
		const unitGroups = new Map<number, EventChunk[]>();
		for (const chunk of allChunks) {
			const unitIdx =
				chunk.unitIndex ??
				this.findUnitIndex(primaryScale, {
					...chunk.event,
					start: chunk.start,
					end: chunk.end,
				} as CalendarEvent);
			if (unitIdx === -1) continue;
			let group = unitGroups.get(unitIdx);
			if (!group) {
				group = [];
				unitGroups.set(unitIdx, group);
			}
			group.push(chunk);
		}

		for (const [unitIdx, chunks] of unitGroups) {
			const unit = primaryScale.units[unitIdx];
			const groupStart = primaryScale.getUnitStart(unitIdx) ?? this.startDate;
			const secScale = createScale(secondaryConfig, groupStart, this.fmt);
			secondaryScales.set(unitIdx, secScale);

			const primitives: Primitive[] = [];
			for (const chunk of chunks) {
				const prim = this.mapToPrimitive(chunk, unit, secScale, primaryAxis);
				if (prim) primitives.push(prim);
			}

			if (doLayout && primitives.length > 0) {
				this.sortBeforeLayout(primitives, section.mode);
				if (section.mode === "bars" || section.mode === "grid") {
					const laid = layoutBars(primitives);
					allPrimitives.push(...laid.primitives);
				} else {
					const laid = layoutBoxes(primitives);
					allPrimitives.push(...laid.primitives);
				}
			} else {
				allPrimitives.push(...primitives);
			}
		}

		// Ensure we have a secondary scale for headers even with no events
		if (secondaryScales.size === 0) {
			const groupStart = primaryScale.getUnitStart(0) ?? this.startDate;
			secondaryScales.set(
				0,
				createScale(secondaryConfig, groupStart, this.fmt)
			);
		}

		// Headers
		const xScale =
			primaryAxis === "x"
				? primaryScale
				: secondaryScales.values().next().value;
		const yScale =
			primaryAxis === "y"
				? primaryScale
				: secondaryScales.values().next().value;

		const xHeaders = xScale ? xScale.getHeaders() : null;
		const yHeaders = yScale ? yScale.getHeaders() : null;

		const cells =
			section.mode === "grid" ? this.buildCells(xScale!, yScale!) : undefined;

		// Cache
		this.cachedSections.push({
			section,
			primaryScale,
			secondaryScales,
			xHeaders,
			yHeaders,
			cells,
		});

		const ui: Record<string, any> = {
			drag:
				section.mode === "boxes" ||
				section.mode === "bars" ||
				section.mode === "grid",
			dragCreate:
				section.mode === "boxes" ||
				section.mode === "bars" ||
				section.mode === "grid",
			...(section.mode === "boxes"
				? { boxLayout: section.boxLayout ?? "split" }
				: {}),
			...section.ui,
		};

		return {
			name: section.name,
			mode: section.mode,
			size: section.size ?? 1,
			primitives: allPrimitives,
			xHeaders,
			yHeaders,
			xVisible: section.xScale.visible,
			yVisible: section.yScale.visible,
			cells,
			ui,
		};
	}

	protected buildCells(_xScale: Scale, _yScale: Scale): GridCell[] {
		return [];
	}

	protected sortBeforeLayout(primitives: Primitive[], mode: string): void {
		if (mode === "bars" || mode === "grid") {
			primitives.sort((a, b) => a.x - b.x);
		} else {
			primitives.sort((a, b) => a.y - b.y);
		}
	}

	private getPrimaryAxis(section: Section): "x" | "y" {
		if (section.primaryScale) return section.primaryScale;
		return section.mode === "boxes" ? "x" : "y";
	}

	protected findUnitIndex(scale: Scale, event: CalendarEvent): number {
		const units = scale.units;
		if (units.length === 0) return -1;
		if (units.length === 1) return 0;

		// Find unit containing this event by checking position
		const pos = scale.eventToPosition(event);

		if (pos.start < 0 && pos.end < 0) return -1;

		for (let i = units.length - 1; i >= 0; i--) {
			if (pos.start >= units[i].position - 0.001) {
				return i;
			}
		}
		return 0;
	}

	private findUnitForPosition(scale: Scale, position: number): number {
		const units = scale.units;
		for (let i = units.length - 1; i >= 0; i--) {
			if (position >= units[i].position - 0.001) {
				return i;
			}
		}
		return 0;
	}

	protected mapToPrimitive(
		chunk: EventChunk,
		primaryUnit: { position: number; size: number },
		secondaryScale: Scale,
		primaryAxis: "x" | "y"
	): Primitive | null {
		const secPos = secondaryScale.eventToPosition({
			...chunk.event,
			start: chunk.start,
			end: chunk.end,
		} as CalendarEvent);

		// Clamp secondary axis to 0-100 range
		const s0 = Math.max(0, secPos.start);
		const s1 = Math.min(100, secPos.end);
		if (s1 <= s0) return null;

		if (primaryAxis === "x") {
			return {
				id: chunk.id,
				event: chunk.event,
				x: primaryUnit.position,
				width: primaryUnit.size,
				y: s0,
				height: s1 - s0,
			};
		} else {
			return {
				id: chunk.id,
				event: chunk.event,
				y: primaryUnit.position,
				height: primaryUnit.size,
				x: s0,
				width: s1 - s0,
			};
		}
	}
}

function deepMerge<T extends Record<string, any>>(
	target: T,
	source: Record<string, any>
): T {
	const result = { ...target } as any;
	for (const key of Object.keys(source)) {
		const sv = source[key];
		const tv = result[key];
		if (
			sv != null &&
			typeof sv === "object" &&
			!Array.isArray(sv) &&
			typeof sv !== "function" &&
			!(sv instanceof Date) &&
			tv != null &&
			typeof tv === "object" &&
			!Array.isArray(tv) &&
			typeof tv !== "function" &&
			!(tv instanceof Date)
		) {
			result[key] = deepMerge(tv, sv);
		} else {
			result[key] = sv;
		}
	}
	return result;
}
