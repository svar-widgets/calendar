<script lang="ts">
	import type { CellCss, ScaleUnit, SectionMode } from "@svar-ui/calendar-store";
	import GridLines from "./GridLines.svelte";
	import GridCells from "./GridCells.svelte";

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

	function hasWeekend(headers: ScaleUnit[][] | null): boolean {
		if (!headers) return false;
		const last = headers[headers.length - 1];
		for (const u of last) if (u.weekend) return true;
		return false;
	}
</script>

{#if cellCss || hasWeekend(xHeaders)}
	<GridCells {xHeaders} {yHeaders} {dx} {dy} {cellCss} {view} {section} {mode} />
{:else}
	<GridLines {xHeaders} {yHeaders} {dx} {dy} />
{/if}
