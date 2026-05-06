<script lang="ts">
	import type { CellCss, ScaleUnit, SectionMode } from "@svar-ui/calendar-store";

	const { xHeaders, yHeaders, dx, dy, cellCss, view, section, mode } = $props<{
		xHeaders: ScaleUnit[][] | null;
		yHeaders: ScaleUnit[][] | null;
		dx: number;
		dy: number;
		cellCss?: CellCss;
		view: string;
		section: string;
		mode: SectionMode;
	}>();

	interface CellInfo {
		x: number;
		y: number;
		width: number;
		height: number;
		css: string;
		weekend: boolean;
	}

	function getDate(unit: ScaleUnit | null): Date | null {
		return unit?.ui?.date instanceof Date ? unit.ui.date : null;
	}

	function combineDates(dateUnit: Date, timeUnit: Date): Date {
		const d = new Date(dateUnit);
		d.setHours(
			timeUnit.getHours(),
			timeUnit.getMinutes(),
			timeUnit.getSeconds(),
			0
		);
		return d;
	}

	function resolveDate(x: ScaleUnit | null, y: ScaleUnit | null): Date | null {
		const xd = getDate(x);
		const yd = getDate(y);
		if (xd && yd) return combineDates(xd, yd);
		return xd ?? yd;
	}

	const cells = $derived.by(() => {
		const xUnits = xHeaders ? xHeaders[xHeaders.length - 1] : null;
		const yUnits = yHeaders ? yHeaders[yHeaders.length - 1] : null;
		const result: CellInfo[] = [];

		const computeCss = cellCss
			? (x: ScaleUnit | null, y: ScaleUnit | null) =>
					cellCss({
						view,
						section,
						mode,
						x,
						y,
						date: resolveDate(x, y),
					})
			: () => "";

		if (xUnits && yUnits) {
			for (const xUnit of xUnits) {
				for (const yUnit of yUnits) {
					result.push({
						x: xUnit.position,
						y: yUnit.position,
						width: xUnit.size,
						height: yUnit.size,
						css: computeCss(xUnit, yUnit),
						weekend: !!(xUnit.weekend || yUnit.weekend),
					});
				}
			}
		} else if (xUnits) {
			for (const xUnit of xUnits) {
				result.push({
					x: xUnit.position,
					y: 0,
					width: xUnit.size,
					height: 100,
					css: computeCss(xUnit, null),
					weekend: !!xUnit.weekend,
				});
			}
		} else if (yUnits) {
			for (const yUnit of yUnits) {
				result.push({
					x: 0,
					y: yUnit.position,
					width: 100,
					height: yUnit.size,
					css: computeCss(null, yUnit),
					weekend: !!yUnit.weekend,
				});
			}
		}

		return result;
	});

	function cellStyle(c: CellInfo) {
		return `left:${dx * c.x}px;top:${dy * c.y}px;width:${dx * c.width}px;height:${dy * c.height}px`;
	}
</script>

<div class="wx-grid" aria-hidden="true">
	{#each cells as c}
		<div
			class="wx-grid-cell {c.css}"
			class:wx-weekend={c.weekend}
			style={cellStyle(c)}
		></div>
	{/each}
</div>

<style>
	.wx-grid {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
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
</style>
