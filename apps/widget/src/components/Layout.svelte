<script lang="ts">
	import type { Snippet } from "svelte";
	import { getContext } from "svelte";
	import type { ILocale } from "@svar-ui/lib-dom";
	import Navigation from "./Navigation.svelte";
	import Sections from "./Render/Sections.svelte";
	import ScrollableSection from "./Render/ScrollableSection.svelte";

	import type { ToolbarItem, Brandmark, CellCss, EventCss } from "@svar-ui/calendar-store";

	const _ = getContext<ILocale>("wx-i18n").getGroup("eventCalendar");

	const {
		store,
		views,
		toolbar,
		cellCss,
		eventCss,
		eventContent,
		children,
		tooltip,
		eventPopup,
		brandmark,
		readonly = false,
	}: {
		store: any;
		views: any;
		toolbar?: { items?: ToolbarItem[] , css?: string } | null;
		cellCss?: CellCss;
		eventCss?: EventCss;
		eventContent?: any;
		children?: Snippet;
		tooltip?: any;
		eventPopup?: any;
		brandmark?: Brandmark;
		readonly?: boolean;
	} = $props();

	// svelte-ignore state_referenced_locally
	const { viewData, currentView, _view } = store.getReactiveState();

	const renderMode = $derived($_view?.render);
</script>

{#snippet viewContent()}
	{#if renderMode === "scrollable"}
		<ScrollableSection data={$viewData} {cellCss} {eventCss} {eventContent} view={$currentView} {tooltip} {eventPopup} {readonly} />
	{:else}
		<Sections data={$viewData} {cellCss} {eventCss} {eventContent} view={$currentView} {tooltip} {eventPopup} {readonly} />
	{/if}
{/snippet}

<div class="wx-calendar" role="region" aria-label={_("Calendar")}>
	{#if toolbar !== null}
		<Navigation {views} toolbar={toolbar} {readonly} />
	{/if}
	{#if children}
		<div class="wx-calendar-content">
			<div class="wx-calendar-sidebar" role="complementary" aria-label={_("Calendar sidebar")}>
				{@render children()}
			</div>
			<div class="wx-calendar-main">
				{@render viewContent()}
				{#if brandmark}
					<a style={brandmark.style} href={brandmark.link} target="_blank">
						{brandmark.text}
					</a>
				{/if}
			</div>
		</div>
	{:else}
		<div class="wx-calendar-main wx-calendar-main--full">
			{@render viewContent()}
			{#if brandmark}
				<a style={brandmark.style} href={brandmark.link} target="_blank">
					{brandmark.text}
				</a>
			{/if}
		</div>
	{/if}
</div>

<style>
	.wx-calendar {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.wx-calendar-content {
		display: flex;
		flex: 1;
		min-height: 0;
	}
	.wx-calendar-sidebar {
		flex-shrink: 0;
		border-right: var(--wx-border);
	}
	.wx-calendar-main {
		flex: 1;
		min-width: 0;
		min-height: 0;
		position: relative;
		display: flex;
		flex-direction: column;
	}
	.wx-calendar-main--full {
		min-height: 0;
	}
</style>
