<script lang="ts">
	import {setID} from "@svar-ui/lib-dom";
	import type { Primitive, EventCss } from "@svar-ui/calendar-store";

	const { primitives, dx, dy, eventCss, eventContent, view, section } = $props<{
		primitives: Primitive[];
		dx: number;
		dy: number;
		eventCss?: EventCss;
		eventContent?: any;
		view: string;
		section: string;
	}>();

	const laneHeight = 28;
	const gap = 2;

	function style(p: Primitive) {
		const left = dx * p.x + gap;
		const width = dx * p.width - gap * 2;
		const lane = p.lane ?? 0;
		const lanes = p.totalLanes ?? 1;
		const groupTop = dy * p.y;
		const groupHeight = dy * p.height;
		const rowLaneHeight = Math.min(laneHeight, groupHeight / lanes);
		const top = groupTop + lane * rowLaneHeight + gap;
		const height = rowLaneHeight - gap * 2;

		return `left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
	}

	function css(p: Primitive): string {
		const base = p.event.css || "";
		const dynamic = eventCss
			? eventCss({ event: p.event, view, section, mode: "bars" })
			: "";
		return base + (dynamic ? " " + dynamic : "");
	}
</script>

<div class="wx-bar-section">
	{#each primitives as p (p.id)}
		<div
			class="wx-bar-event {css(p)}"
			class:wx-bar-single-day={p.isMultiDay}
			style={style(p)}
			data-id={setID(p.id)}
		>
			{#if eventContent}
				{@const EventContentCmp = eventContent}
				<EventContentCmp event={p.event} mode="bars" />
			{:else}
				<span class="wx-bar-title">
					{p.event.text || " "}
				</span>
			{/if}
		</div>
	{/each}
</div>

<style>
	.wx-bar-section {
		position: relative;
		width: 100%;
		height: 100%;
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
		padding: 0 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: var(--wx-font-size-sm);
		line-height: 1.2;
	}
</style>
