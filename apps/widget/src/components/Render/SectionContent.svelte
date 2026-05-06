<script lang="ts">
	import type { SectionResult, CellCss, EventCss } from "@svar-ui/calendar-store";
	import BoxSection from "./BoxSection.svelte";
	import BarSection from "./BarSection.svelte";
	import GridSection from "./GridSection.svelte";
	import ListSection from "./ListSection.svelte";
	import YearSection from "./YearSection.svelte";
	import Grid from "./Grid.svelte";
	import NowLine from "./NowLine.svelte";

	const {
		section,
		dx,
		dy,
		scrollHeight,
		measured,
		cellCss,
		eventCss,
		eventContent,
		view,
		tooltip,
		onoverflow,
	} = $props<{
		section: SectionResult;
		dx: number;
		dy: number;
		scrollHeight: number | null;
		measured: boolean;
		cellCss?: CellCss;
		eventCss?: EventCss;
		eventContent?: any;
		view: string;
		tooltip?: any;
		onoverflow?: (overflow: boolean) => void;
	}>();

</script>

{#if section.mode === "list"}
	<ListSection primitives={section.primitives} {eventContent} />
{:else if section.mode === "year"}
	<YearSection {section} {tooltip} {eventContent} />
{:else if measured}
	{#snippet gridContent()}
		{#if section.mode === "grid" && section.cells}
			<GridSection
				primitives={section.primitives}
				cells={section.cells}
				{dx}
				{dy}
				{cellCss}
				{eventCss}
				{eventContent}
				{view}
				section={section.name}
				{onoverflow}
			/>
		{:else}
			<Grid
				xHeaders={section.xHeaders}
				yHeaders={section.yHeaders}
				{dx}
				{dy}
				{cellCss}
				{view}
				section={section.name}
				mode={section.mode}
			/>
			{#if section.mode === "boxes"}
				<BoxSection
					primitives={section.primitives}
					{dx}
					{dy}
					layoutMode={section.ui?.boxLayout ?? "split"}
					{eventCss}
					{eventContent}
					{view}
					section={section.name}
				/>
			{:else}
				<BarSection
					primitives={section.primitives}
					{dx}
					{dy}
					{eventCss}
					{eventContent}
					{view}
					section={section.name}
				/>
			{/if}
			{#if section.ui?.nowLine}
				<NowLine yHeaders={section.yHeaders} {dy} />
			{/if}
		{/if}
	{/snippet}

	{#if scrollHeight !== null}
		<div class="wx-scroll-inner" style="height:{scrollHeight}px">
			{@render gridContent()}
		</div>
	{:else}
		{@render gridContent()}
	{/if}
{/if}

<style>
	.wx-scroll-inner {
		position: relative;
		width: 100%;
	}
</style>
