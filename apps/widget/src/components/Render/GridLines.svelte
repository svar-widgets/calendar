<script lang="ts">
	import type { ScaleUnit } from "@svar-ui/calendar-store";

	const { xHeaders, yHeaders, dx, dy } = $props<{
		xHeaders: ScaleUnit[][] | null;
		yHeaders: ScaleUnit[][] | null;
		dx: number;
		dy: number;
	}>();
</script>

<div class="wx-grid" aria-hidden="true">
	{#if xHeaders}
		{#each xHeaders[xHeaders.length - 1].slice(0, -1) as unit}
			<div
				class="wx-grid-line wx-vertical"
				style="left: {dx * (unit.position + unit.size)}px"
			></div>
		{/each}
	{/if}
	{#if yHeaders}
		{#each yHeaders[yHeaders.length - 1].slice(0, -1) as unit}
			<div
				class="wx-grid-line wx-horizontal"
				style="top: {dy * (unit.position + unit.size)}px"
			></div>
		{/each}
	{/if}
</div>

<style>
	.wx-grid {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 0;
	}
	.wx-grid-line {
		position: absolute;
		background-color: var(--wx-calendar-grid-color);
	}
	.wx-grid-line.wx-vertical {
		top: 0;
		width: 1px;
		height: 100%;
	}
	.wx-grid-line.wx-horizontal {
		left: 0;
		height: 1px;
		width: 100%;
	}
</style>
