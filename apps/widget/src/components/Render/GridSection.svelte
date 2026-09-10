<script lang="ts">
	import type {
		Primitive,
		GridCell,
		CellCss,
		EventCss,
		EventOverflowMode,
	} from "@svar-ui/calendar-store";
	import { setID } from "@svar-ui/lib-dom";

	const {
		primitives,
		cells,
		dx,
		dy,
		cellCss,
		eventCss,
		eventContent,
		view,
		section,
		eventOverflow = "more",
		onoverflow,
	} = $props<{
		primitives: Primitive[];
		cells: GridCell[];
		dx: number;
		dy: number;
		cellCss?: CellCss;
		eventCss?: EventCss;
		eventContent?: any;
		view: string;
		section: string;
		eventOverflow?: EventOverflowMode;
		onoverflow?: (overflow: boolean) => void;
	}>();

	const laneHeight = 22;
	const gap = 2;
	const fullLaneHeight = laneHeight + gap * 2;
	const dayLabelHeight = 20;
	const moreLabelHeight = 18;

	// Track which rows (by y position) are expanded
	let expandedRows = $state<Set<number>>(new Set());

	// Compute per-row: max visible lanes and extra offset for expanded rows
	const rowLayout = $derived.by(() => {
		// Collect per-row max lane counts
		const rowInfo = new Map<
			number,
			{ totalLanes: number; height: number }
		>();
		for (const p of primitives) {
			const existing = rowInfo.get(p.y);
			const lanes = p.totalLanes ?? 1;
			if (!existing || lanes > existing.totalLanes) {
				rowInfo.set(p.y, { totalLanes: lanes, height: p.height });
			}
		}

		const layout = new Map<
			number,
			{
				maxVisible: number;
				expanded: boolean;
				extraHeight: number;
			}
		>();

		for (const [y, info] of rowInfo) {
			const groupHeight = dy * info.height - dayLabelHeight;
			// Only reserve space for "+more" label if lanes don't all fit
			const allFit =
				Math.floor(groupHeight / fullLaneHeight) >= info.totalLanes;
			const maxVisible = allFit
				? info.totalLanes
				: Math.max(
						0,
						Math.floor(
							(groupHeight - moreLabelHeight) / fullLaneHeight
						)
					);
			const isExpanded =
				eventOverflow === "expand" || expandedRows.has(y);

			let extraHeight = 0;
			if (isExpanded && info.totalLanes > maxVisible) {
				// Extra pixels needed beyond the normal row height
				const neededHeight =
					dayLabelHeight + info.totalLanes * fullLaneHeight;
				const normalHeight = dy * info.height;
				extraHeight = Math.max(0, neededHeight - normalHeight);
			}

			layout.set(y, {
				maxVisible,
				expanded: isExpanded,
				extraHeight,
			});
		}

		return layout;
	});

	// Cumulative extra offset per row — sorted by y position
	const rowExtraOffsets = $derived.by(() => {
		const offsets = new Map<number, number>();
		const sorted = [...rowLayout.entries()].sort((a, b) => a[0] - b[0]);
		let cumulative = 0;
		for (const [y, info] of sorted) {
			offsets.set(y, cumulative);
			cumulative += info.extraHeight;
		}
		return { offsets, totalExtra: cumulative };
	});

	function getRowOffset(y: number): number {
		return rowExtraOffsets.offsets.get(y) ?? 0;
	}

	// Total height — only set when rows are expanded to avoid sub-pixel overflow
	const totalExtra = $derived(rowExtraOffsets.totalExtra);
	const totalHeight = $derived(
		totalExtra > 0 ? dy * 100 + totalExtra : null
	);

	const hasOverflow = $derived(totalExtra > 0);
	$effect(() => {
		onoverflow?.(hasOverflow);
	});

	// Partition primitives into visible and hidden-by-row in one pass
	const { visiblePrimitives, hiddenByRow } = $derived.by(() => {
		const visible: Primitive[] = [];
		const hidden = new Map<number, Primitive[]>();
		for (const p of primitives) {
			const info = rowLayout.get(p.y);
			if (!info || info.expanded || (p.lane ?? 0) < info.maxVisible) {
				visible.push(p);
			} else {
				let arr = hidden.get(p.y);
				if (!arr) {
					arr = [];
					hidden.set(p.y, arr);
				}
				arr.push(p);
			}
		}
		return { visiblePrimitives: visible, hiddenByRow: hidden };
	});

	// Per-cell "+N more" indicators
	const moreIndicators = $derived.by(() => {
		const indicators: {
			rowY: number;
			cellX: number;
			cellWidth: number;
			count: number;
		}[] = [];

		for (const cell of cells) {
			const hidden = hiddenByRow.get(cell.y);
			if (!hidden) continue;
			let count = 0;
			for (const p of hidden) {
				if (p.x < cell.x + cell.width && p.x + p.width > cell.x) {
					count++;
				}
			}
			if (count > 0) {
				indicators.push({
					rowY: cell.y,
					cellX: cell.x,
					cellWidth: cell.width,
					count,
				});
			}
		}

		return indicators;
	});

	function barStyle(p: Primitive) {
		const left = dx * p.x + gap;
		const width = dx * p.width - gap * 2;
		const lane = p.lane ?? 0;
		const groupTop = dy * p.y + dayLabelHeight + getRowOffset(p.y);
		const top = groupTop + lane * fullLaneHeight + gap;
		const height = laneHeight;

		return `left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
	}

	function formatTime(date: Date): string {
		const h = date.getHours();
		const m = date.getMinutes();
		if (m === 0) return `${h % 12 || 12}${h < 12 ? "am" : "pm"}`;
		return `${h % 12 || 12}:${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
	}

	function eventLabel(p: Primitive): string {
		return p.event.text || " ";
	}

	function eventTime(p: Primitive): string {
		if (p.isMultiDay === false) {
			return `${formatTime(p.event.start)} `;
		}
		return "";
	}

	function dateStr(date: Date): string {
		const y = date.getFullYear();
		const m = String(date.getMonth() + 1).padStart(2, "0");
		const d = String(date.getDate()).padStart(2, "0");
		return `${y}-${m}-${d}`;
	}

	function css(p: Primitive): string {
		const base = p.event.css || "";
		const dynamic = eventCss
			? eventCss({ event: p.event, view, section, mode: "grid" })
			: "";
		return base + (dynamic ? " " + dynamic : "");
	}

	function cellStyle(cell: GridCell) {
		const offset = getRowOffset(cell.y);
		const info = rowLayout.get(cell.y);
		const extra = info?.extraHeight ?? 0;
		const left = dx * cell.x;
		const top = dy * cell.y + offset;
		const width = dx * cell.width;
		const height = dy * cell.height + extra;
		return `left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
	}

	function moreStyle(indicator: {
		rowY: number;
		cellX: number;
		cellWidth: number;
		count: number;
	}) {
		const offset = getRowOffset(indicator.rowY);
		const info = rowLayout.get(indicator.rowY)!;
		const top =
			dy * indicator.rowY +
			dayLabelHeight +
			offset +
			info.maxVisible * fullLaneHeight;
		const left = dx * indicator.cellX;
		const width = dx * indicator.cellWidth;
		return `left:${left}px;top:${top}px;width:${width}px;height:${moreLabelHeight}px`;
	}

	function toggleRow(y: number) {
		const next = new Set(expandedRows);
		if (next.has(y)) {
			next.delete(y);
		} else {
			next.add(y);
		}
		expandedRows = next;
	}
</script>

<div
	class="wx-grid-section"
	style:height={totalHeight !== null ? `${totalHeight}px` : undefined}
>
	{#each cells as cell}
		<div
			class="wx-grid-cell {cellCss
				? cellCss({
						view,
						section,
						mode: 'grid',
						x: null,
						y: null,
						date: cell.date,
					})
				: ''}"
			class:wx-weekend={cell.weekend}
			class:wx-out-of-month={!cell.inMonth}
			class:wx-today={cell.today}
			aria-current={cell.today ? "date" : undefined}
			style={cellStyle(cell)}
		>
			<span class="wx-day-number" data-date={dateStr(cell.date)}
				>{cell.day}</span
			>
		</div>
	{/each}

	{#each visiblePrimitives as p (p.id)}
		<div
			class="wx-bar-event {css(p)}"
			class:wx-bar-single-day={p.isMultiDay === false}
			style={barStyle(p)}
			data-id={setID(p.id)}
		>
			{#if eventContent}
				{@const EventContentCmp = eventContent}
				<EventContentCmp event={p.event} mode="grid" />
			{:else}
				<span class="wx-bar-marker"></span>
				<span class="wx-bar-time">{eventTime(p)}</span>
				<span class="wx-bar-title">{eventLabel(p)}</span>
			{/if}
		</div>
	{/each}

	{#each moreIndicators as indicator}
		<button
			class="wx-more-button"
			style={moreStyle(indicator)}
			onclick={() => toggleRow(indicator.rowY)}
		>
			+{indicator.count} more
		</button>
	{/each}
</div>

<style>
	.wx-grid-section {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.wx-grid-cell {
		position: absolute;
		box-sizing: border-box;
		border-right: var(--wx-border);
		border-bottom: var(--wx-border);
	}
	.wx-grid-cell.wx-weekend {
		background-color: var(--wx-calendar-weekend-background);
	}
	.wx-grid-cell.wx-out-of-month {
		background-color: var(--wx-background-alt);
	}
	.wx-grid-cell.wx-today {
		background-color: var(--wx-color-primary-selected);
	}

	.wx-day-number {
		display: block;
		padding: 2px 4px;
		font-size: var(--wx-font-size-sm);
		text-align: right;
		cursor: pointer;
	}
	.wx-out-of-month .wx-day-number {
		color: var(--wx-color-font-alt);
	}
	.wx-today .wx-day-number {
		font-weight: var(--wx-font-weight-b);
		color: var(--wx-color-primary);
	}

	.wx-bar-event {
		position: absolute;
		background-color: var(--wx-color-primary);
		color: var(--wx-color-primary-font);
		border-radius: var(--wx-border-radius);
		overflow: hidden;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
		cursor: pointer;
		display: flex;
		align-items: center;
		z-index: 1;
	}
	.wx-bar-event:hover {
		opacity: 0.9;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
	}
	.wx-bar-single-day {
		background-color: transparent;
		color: var(--wx-color-font);
		box-shadow: none;
		border-radius: 0;
	}
	.wx-bar-single-day:global(.wx-dragging) {
		background-color: var(--wx-background);
	}
	.wx-bar-single-day:hover {
		background-color: var(--wx-color-secondary-hover);
		box-shadow: none;
		opacity: 1;
	}
	.wx-bar-title {
		padding: 0 6px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 12px;
		line-height: 1.2;
	}

	.wx-more-button {
		position: absolute;
		background: none;
		border: none;
		box-sizing: border-box;
		padding: 0 4px;
		font-size: 12px;
		color: var(--wx-color-link, var(--wx-color-primary));
		cursor: pointer;
		z-index: 2;
		text-align: left;
		line-height: 18px;
	}
	.wx-more-button:hover {
		text-decoration: underline;
	}

	.wx-bar-time {
		font-weight: var(--wx-font-weight-md);
		font-size: 12px;
		margin-bottom: 1px;
		margin-left: 4px;
	}

	.wx-bar-marker {
		display: block;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background-color: var(--wx-color-primary);
		margin-bottom: 1px;
		margin-left: 4px;
	}
</style>
