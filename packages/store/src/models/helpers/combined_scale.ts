import type {
	CalendarEvent,
	Scale,
	ScaleUnit,
	ScaleSegment,
	ScaleValue,
} from "../../types";

interface CombinedLeaf {
	outerIndex: number;
	innerIndex: number;
}

function compositeId(outer: ScaleUnit, inner: ScaleUnit): string {
	return outer.id + "#" + inner.id;
}

function combineUnit(
	outer: ScaleUnit,
	inner: ScaleUnit,
	position: number,
	size: number
): ScaleUnit {
	return {
		id: compositeId(outer, inner),
		label: inner.label,
		position,
		size,
		weekend: inner.weekend ?? outer.weekend,
		ui: {
			...outer.ui,
			...inner.ui,
			combined: { outer, inner },
		},
	};
}

function findUnitForPosition(units: ScaleUnit[], position: number): number {
	for (let i = units.length - 1; i >= 0; i--) {
		if (position >= units[i].position - 0.001) return i;
	}
	return 0;
}

export class CombinedScale implements Scale {
	outer: Scale;
	inner: Scale;
	units: ScaleUnit[];
	private headers: ScaleUnit[][];
	private leaves: CombinedLeaf[];

	constructor(outer: Scale, inner: Scale) {
		this.outer = outer;
		this.inner = inner;
		this.leaves = [];

		const innerHeaders = inner.getHeaders();
		this.headers = [...outer.getHeaders()];
		for (const level of innerHeaders) {
			const repeated: ScaleUnit[] = [];
			for (let oi = 0; oi < outer.units.length; oi++) {
				const outerUnit = outer.units[oi];
				for (const innerUnit of level) {
					repeated.push(
						combineUnit(
							outerUnit,
							innerUnit,
							outerUnit.position + (innerUnit.position / 100) * outerUnit.size,
							(innerUnit.size / 100) * outerUnit.size
						)
					);
				}
			}
			this.headers.push(repeated);
		}

		this.units = this.headers[this.headers.length - 1] ?? [];
		for (let oi = 0; oi < outer.count; oi++) {
			for (let ii = 0; ii < inner.count; ii++) {
				this.leaves.push({ outerIndex: oi, innerIndex: ii });
			}
		}
	}

	get count(): number {
		return this.outer.count * this.inner.count;
	}

	eventToPosition(event: CalendarEvent): { start: number; end: number } {
		const first = this.segmentEvent(event)[0];
		if (!first) return { start: -1, end: -1 };
		const unit = this.units[first.unitIndex];
		return { start: unit.position, end: unit.position + unit.size };
	}

	contains(date: Date): boolean {
		return this.outer.contains(date) && this.inner.contains(date);
	}

	getHeaders(): ScaleUnit[][] {
		return this.headers;
	}

	positionToValue(position: number): ScaleValue[] {
		const index = findUnitForPosition(this.units, position);
		const leaf = this.leaves[index];
		return [
			this.outer.positionToValue(this.outer.units[leaf.outerIndex].position),
			this.inner.positionToValue(this.inner.units[leaf.innerIndex].position),
		];
	}

	segmentEvent(event: CalendarEvent): ScaleSegment[] {
		const result: ScaleSegment[] = [];
		for (const outerSegment of this.outer.segmentEvent(event)) {
			const scoped = {
				...event,
				start: outerSegment.start,
				end: outerSegment.end,
			};
			for (const innerSegment of this.inner.segmentEvent(scoped)) {
				result.push({
					start: innerSegment.start,
					end: innerSegment.end,
					unitIndex:
						outerSegment.unitIndex * this.inner.count + innerSegment.unitIndex,
					...(innerSegment.sourceUnitId !== undefined
						? { sourceUnitId: innerSegment.sourceUnitId }
						: outerSegment.sourceUnitId !== undefined
							? { sourceUnitId: outerSegment.sourceUnitId }
							: {}),
				});
			}
		}
		return result;
	}

	getUnitStart(unitIndex: number): Date | null {
		const leaf = this.leaves[unitIndex];
		if (!leaf) return null;
		return (
			this.inner.getUnitStart(leaf.innerIndex) ??
			this.outer.getUnitStart(leaf.outerIndex)
		);
	}

	applyPosition(
		position: number,
		target: "start" | "end",
		event?: Partial<CalendarEvent>,
		snap?: boolean
	): Partial<CalendarEvent> {
		const index = findUnitForPosition(this.units, position);
		const leaf = this.leaves[index];
		let result = event ? { ...event } : {};
		Object.assign(
			result,
			this.outer.applyPosition(
				this.outer.units[leaf.outerIndex].position,
				target,
				result,
				snap
			)
		);
		Object.assign(
			result,
			this.inner.applyPosition(
				this.inner.units[leaf.innerIndex].position,
				target,
				result,
				snap
			)
		);
		return result;
	}
}
