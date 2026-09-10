<script lang="ts">
	import { getContext, onMount, untrack } from "svelte";
	import type { SectionResult, CellCss, EventCss } from "@svar-ui/calendar-store";
	import type { CalendarContextApi } from "../../types.js";
	import { drag } from "../../directives/drag.js";
	import { clickevent } from "../../directives/clickevent.js";
	import { clickdate } from "../../directives/clickdate.js";
	import { Popup } from "@svar-ui/svelte-core";
	import Headers from "./Headers.svelte";
	import SectionContent from "./SectionContent.svelte";
	import EventProjection from "./EventProjection.svelte";
	import { resolveEventPosition } from "./resolveEventPosition.js";
	import { useEventOverlay } from "../useEventOverlay.svelte.js";

	const api = getContext<CalendarContextApi>("calendar-api");
	const { _view } = api.getReactiveState();

	const { data, cellCss, eventCss, eventContent, view, tooltip, eventPopup, readonly = false, eventProjection } = $props<{
		data: SectionResult[];
		cellCss?: CellCss;
		eventCss?: EventCss;
		eventContent?: any;
		view: string;
		tooltip?: any;
		eventPopup?: any;
		readonly?: boolean;
		eventProjection?: any;
	}>();

	const section = $derived(data[0]);
	const xHeaders = $derived(section?.xHeaders ?? null);
	const yHeaders = $derived(section?.yHeaders ?? null);
	const showXHeaders = $derived(xHeaders !== null && section?.xVisible !== false);
	const showYHeaders = $derived(yHeaders !== null && section?.yVisible !== false);

	// oxlint-disable-next-line no-unused-vars no-unassigned-vars
	let contentEl: HTMLElement;
	let contentWidth = $state(0);
	let contentHeight = $state(0);
	let ready = $state(false);

	function measure() {
		if (contentEl) {
			const rect = contentEl.getBoundingClientRect();
			const w = Math.round(rect.width * 1000) / 1000;
			const h = Math.round(rect.height * 1000) / 1000;
			if (w !== contentWidth || h !== contentHeight) {
				contentWidth = w;
				contentHeight = h;
			}
		}
	}

	onMount(() => {
		measure();
		ready = true;
		const ro = new ResizeObserver(() => measure());
		ro.observe(contentEl);
		return () => ro.disconnect();
	});

	const dx = $derived(contentWidth / 100);
	const dy = $derived(contentHeight / 100);

	function getMinContentWidth(): number {
		if (!xHeaders) return 0;
		const inner = xHeaders[xHeaders.length - 1];
		if (!inner?.length) return 0;
		const v = inner[0].ui?.minUnitWidth;
		return typeof v === "number" ? inner.length * v : 0;
	}

	function getMinContentHeight(): number {
		if (!yHeaders) return 0;
		const inner = yHeaders[yHeaders.length - 1];
		if (!inner?.length) return 0;
		const v = inner[0].ui?.minUnitHeight;
		return typeof v === "number" ? inner.length * v : 0;
	}

	const minW = $derived(getMinContentWidth());
	const minH = $derived(getMinContentHeight());

	const projection = $derived.by(() => {
		if (!eventProjection || !eventProjection.htmlEvent) return null;
		const event = resolveEventPosition(
			eventProjection.htmlEvent,
			eventProjection.event,
			section,
			contentEl,
			dx,
			dy,
			$_view,
			document
		);
		if (!event) return null;
		// store calculated props on the original projection object
		untrack(() => {
			Object.assign(eventProjection.event, event);
		});
		return $_view.projectEvent(event).find(item => item.section === section.name);
	});

	const overlay = useEventOverlay(
		id => api.getEvent(id),
		() => (section?.mode === "boxes" ? "right-start" : "bottom-start")
	);

	// trackScroll exists in Popup but is missing from its .d.ts
	const popupExtra: Record<string, any> = { trackScroll: true };
</script>

<div class="wx-scrollable-section">
	<div
		class="wx-scroll-grid"
		class:wx-has-x-headers={showXHeaders}
		class:wx-has-y-headers={showYHeaders}
	>
		{#if showXHeaders && showYHeaders}
			<div class="wx-corner"></div>
		{/if}
		{#if showXHeaders}
			<div class="wx-x-headers-sticky">
				<Headers headers={xHeaders} direction="x" />
			</div>
		{/if}
		{#if showYHeaders}
			<div class="wx-y-headers-sticky">
				<Headers headers={yHeaders} direction="y" />
			</div>
		{/if}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="wx-content"
			style:min-width={minW > 0 ? `${minW}px` : undefined}
			style:min-height={minH > 0 ? `${minH}px` : undefined}
			bind:this={contentEl}
			use:clickevent={{
				exec: api.exec,
				getEvent: id => api.getEvent(id),
				onEventPopup: eventPopup ? overlay.handleEventPopup : undefined,
			}}
			use:clickdate={{ exec: api.exec }}
			onmousemove={tooltip ? overlay.handleTooltipMove : undefined}
			onmouseleave={tooltip ? overlay.handleTooltipLeave : undefined}
			use:drag={{
				mode: section?.mode ?? "boxes",
				dx,
				dy,
				xHeaders,
				yHeaders,
				sectionName: section?.name ?? "",
				model: $_view,
				exec: api.exec,
				getEvent: id => api.getEvent(id),
				move: !readonly && !!section?.ui?.drag,
				clipDrag: section?.ui?.clipDrag !== false,
				create: !readonly && !!section?.ui?.dragCreate,
			}}
		>
			{#if section?.ui?.dragCreate}
				<div class="wx-drag-stub" data-drag-stub aria-hidden="true"></div>
			{/if}
			{#if section}
				<SectionContent
					{section}
					{dx}
					{dy}
					scrollHeight={null}
					measured={ready && contentWidth > 0 && contentHeight > 0}
					{cellCss}
					{eventCss}
					{eventContent}
					{view}
					{tooltip}
				/>
				{#if projection}
					<EventProjection
						primitives={projection.primitives}
						{dx}
						{dy}
					/>
				{/if}
			{/if}
		</div>
	</div>

	{#if overlay.tooltipState && tooltip}
		{@const TooltipCmp = tooltip}
		<div
			class="wx-calendar-tooltip"
			style="position:fixed;left:{overlay.mousePos.x + 12}px;top:{overlay.mousePos.y + 16}px;z-index:10000;pointer-events:none"
			aria-hidden="true"
		>
			<TooltipCmp event={overlay.tooltipState.event} />
		</div>
	{/if}

	{#if overlay.eventPopupState && eventPopup}
		{@const EventPopupCmp = eventPopup}
		<Popup
			at={overlay.eventPopupState.at}
			parent={overlay.eventPopupState.element}
			oncancel={overlay.hideEventPopup}
			{...popupExtra}
		>
			<EventPopupCmp
				event={overlay.eventPopupState.event}
				close={overlay.hideEventPopup}
			/>
		</Popup>
	{/if}
</div>

<style>
	.wx-scrollable-section {
		flex: 1;
		min-height: 0;
		overflow: auto;
	}

	.wx-scroll-grid {
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		min-height: 100%;
	}
	.wx-scroll-grid.wx-has-y-headers {
		grid-template-columns: auto 1fr;
	}
	.wx-scroll-grid.wx-has-x-headers {
		grid-template-rows: auto 1fr;
	}

	.wx-corner {
		position: sticky;
		top: 0;
		left: 0;
		z-index: 3;
		background: var(--wx-background);
		width: var(--wx-calendar-y-scale-width, 60px);
		border-right: var(--wx-border);
		border-bottom: var(--wx-border);
	}

	.wx-x-headers-sticky {
		position: sticky;
		top: 0;
		z-index: 2;
		background: var(--wx-background);
	}

	.wx-y-headers-sticky {
		position: sticky;
		left: 0;
		z-index: 1;
		background: var(--wx-background);
	}

	.wx-content {
		position: relative;
		z-index: 0;
	}
</style>
