<script lang="ts">
	import { getContext, onMount, tick, untrack } from "svelte";
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

	let ready = $state(false);

	let sectionEls: Record<string, HTMLElement> = $state({});
	let contentEls: Record<string, HTMLElement> = $state({});
	let sizes = $state<Record<string, { width: number; height: number }>>({});
	let xHeadersEl: HTMLElement | undefined = $state();
	let xHeadersHeight = $state(0);

	function measure() {
		const next: Record<string, { width: number; height: number }> = {};
		let changed = false;
		for (const section of data) {
			const sectionEl = sectionEls[section.name];
			const contentEl = contentEls[section.name];
			if (sectionEl && contentEl) {
				const w = contentEl.clientWidth;
				const h = sectionEl.clientHeight;
				next[section.name] = { width: w, height: h };
				const prev = sizes[section.name];
				if (!prev || prev.width !== w || prev.height !== h) {
					changed = true;
				}
			}
		}
		if (changed) sizes = next;
		const xh = xHeadersEl ? xHeadersEl.clientHeight : 0;
  		if (xh !== xHeadersHeight) xHeadersHeight = xh;
	}

	let ro: ResizeObserver | null = null;

	function observeAll() {
		if (!ro) return;
		ro.disconnect();
		for (const section of data) {
			const el = sectionEls[section.name];
			if (el) ro.observe(el);
		}
		if (xHeadersEl) ro.observe(xHeadersEl);
	}

	onMount(() => {
		measure();
		ready = true;

		ro = new ResizeObserver(() => measure());
		observeAll();
		return () => ro?.disconnect();
	});

	$effect(() => {
		if (!ready || !ro) return;
		// oxlint-disable-next-line no-unused-expressions
		data;
		tick().then(() => {
			observeAll();
			measure();
		});
	});

	function dx(name: string) {
		return (sizes[name]?.width ?? 0) / 100;
	}

	function getMinContentHeight(section: SectionResult): number {
		if (!section.yHeaders) return 0;
		const innerLevel = section.yHeaders[section.yHeaders.length - 1];
		if (!innerLevel || innerLevel.length === 0) return 0;
		const first = innerLevel[0];
		const minUnitHeight = first.ui?.minUnitHeight;
		return typeof minUnitHeight === "number"
			? innerLevel.length * minUnitHeight
			: 0;
	}

	// Lane height must match BarSection.svelte
	const BAR_LANE_HEIGHT = 28;

	function getBarSectionHeight(section: SectionResult): number {
		if (section.mode !== "bars" || typeof section.size === "number") return 0;
		let maxLanes = 0;
		for (const p of section.primitives) {
			const lanes = p.totalLanes ?? 1;
			if (lanes > maxLanes) maxLanes = lanes;
		}
		if (!maxLanes && projectionFor(section.name)) {
			maxLanes = 1;
		}
		return maxLanes * BAR_LANE_HEIGHT;
	}

	function dy(name: string, section: SectionResult) {
		const containerHeight = sizes[name]?.height ?? 0;
		const minHeight = getMinContentHeight(section);
		const barHeight = getBarSectionHeight(section);
		return Math.max(containerHeight, minHeight, barHeight) / 100;
	}

	function sectionMinHeight(section: SectionResult): number {
		if (typeof section.size !== "number") {
			return getBarSectionHeight(section);
		}
		return getMinContentHeight(section);
	}

	const projections = $derived.by(() => {
		if (!eventProjection || !eventProjection.htmlEvent) return [];
		let event;
		for (let item of visibleSections) {
			event = resolveEventPosition(
				eventProjection.htmlEvent,
				eventProjection.event,
				item,
				contentEls[item.name],
				dx(item.name),
				dy(item.name, item),
				$_view,
				document
			);
			if (event) break;
		}
		if (!event) return [];
		// store calculated props on the original projection object
		untrack(() => {
			Object.assign(eventProjection.event, event);
		});
		return $_view.projectEvent(event);
	});

	function projectionFor(section: string) {
		return projections.find(item => item.section === section);
	}

	const visibleSections = $derived(
		data.filter(
			(s: SectionResult) =>
				s.size !== "content-optional" ||
				s.primitives.length > 0 ||
				!!projectionFor(s.name)
		)
	);

	// Sticky prefix: consecutive content-sized sections from the top.
	// The first non-content section ends the prefix; later content sections
	// (if any) scroll normally.
	const stickyCount = $derived.by(() => {
		let count = 0;
		for (const s of visibleSections) {
			const sz = s.size ?? 1;
			if (sz === "content" || sz === "content-optional") count++;
			else break;
		}
		return count;
	});

	// Cumulative `top` for each sticky section, starting after x-headers.
	const stickyOffsets = $derived.by(() => {
		const offsets: number[] = [];
		let acc = xHeadersHeight;
		for (let i = 0; i < stickyCount; i++) {
			offsets[i] = acc;
			const name = visibleSections[i].name;
			acc += sizes[name]?.height ?? 0;
		}
		return offsets;
	});

	let gridOverflow = $state<Record<string, boolean>>({});
	function onGridOverflow(section: string, overflow: boolean) {
		if (!!gridOverflow[section] === overflow) return;
		gridOverflow = { ...gridOverflow, [section]: overflow };
	}

	const hasYHeaders = $derived(
		visibleSections.some((s: SectionResult) => s.yHeaders !== null && s.yVisible !== false)
	);

	const xHeaders = $derived(
		visibleSections.find((s: SectionResult) => s.xHeaders !== null && s.xVisible !== false)
			?.xHeaders ?? null
	);

	function sectionFlex(section: SectionResult, sticky: boolean): string {
		if (sticky) return "0 0 auto";
		// list and year render as natural DOM flow — size to content,
		// let the outer container scroll when total exceeds viewport.
		if (section.mode === "list" || section.mode === "year") return "0 0 auto";
		return typeof section.size === "number" ? "1" : "0 0 auto";
	}

	const overlay = useEventOverlay(
		id => api.getEvent(id),
		el => {
			const section = visibleSections.find((s: SectionResult) =>
				sectionEls[s.name]?.contains(el)
			);
			return section?.mode === "boxes" ? "right-start" : "bottom-start";
		}
	);

	// trackScroll exists in Popup but is missing from its .d.ts
	const popupExtra: Record<string, any> = { trackScroll: true };
</script>

<div class="wx-sections">
	{#if xHeaders}
		<div class="wx-x-headers-row" bind:this={xHeadersEl}>
			{#if hasYHeaders}
				<div class="wx-header-corner"></div>
			{/if}
			<div class="wx-x-headers-area">
				<Headers headers={xHeaders} direction="x" />
			</div>
		</div>
	{/if}

	{#each visibleSections as section, idx (section.name)}
		{@const sticky = idx < stickyCount}
		{@const secDx = dx(section.name)}
		{@const secDy = dy(section.name, section)}
		{@const minH = sectionMinHeight(section)}
		{@const projection = projectionFor(section.name)}
		<div
			class="wx-section"
			class:wx-section-last={idx === visibleSections.length - 1}
			class:wx-section-sticky={sticky}
			class:wx-section-grid={section.mode === "grid" &&
				!!gridOverflow[section.name]}
			class:wx-has-y-headers={hasYHeaders}
			style:flex={sectionFlex(section, sticky)}
			style:min-height={minH > 0 ? `${minH}px` : undefined}
			style:top={sticky ? `${stickyOffsets[idx] ?? 0}px` : undefined}
			style:z-index={sticky ? 10 - idx : undefined}
			bind:this={sectionEls[section.name]}
		>
			{#if section.yVisible !== false}
				<div class="wx-y-headers-area">
					<Headers headers={section.yHeaders} direction="y" />
				</div>
			{:else if hasYHeaders}
				<div class="wx-header-spacer"></div>
			{/if}

			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="wx-section-content"
				bind:this={contentEls[section.name]}
				use:drag={{
					mode: section.mode,
					dx: secDx,
					dy: secDy,
					xHeaders: section.xHeaders,
					yHeaders: section.yHeaders,
					sectionName: section.name,
					model: $_view,
					exec: api.exec,
					getEvent: id => api.getEvent(id),
					move: !readonly && !!section.ui?.drag,
					clipDrag: section.ui?.clipDrag !== false,
					create: !readonly && !!section.ui?.dragCreate,
				}}
				use:clickevent={{
					exec: api.exec,
					getEvent: id => api.getEvent(id),
					onEventPopup: eventPopup ? overlay.handleEventPopup : undefined,
				}}
				use:clickdate={{ exec: api.exec }}
				onmousemove={tooltip ? overlay.handleTooltipMove : undefined}
				onmouseleave={tooltip ? overlay.handleTooltipLeave : undefined}
			>
				{#if section.ui?.dragCreate}
					<div class="wx-drag-stub" data-drag-stub aria-hidden="true"></div>
				{/if}
				<SectionContent
					{section}
					dx={secDx}
					dy={secDy}
					scrollHeight={null}
					measured={ready && !!sizes[section.name]}
					{cellCss}
					{eventCss}
					{eventContent}
					{view}
					{tooltip}
					onoverflow={section.mode === "grid"
						? overflow => onGridOverflow(section.name, overflow)
						: undefined}
				/>
				{#if projection}
					<EventProjection
						primitives={projection.primitives}
						dx={secDx}
						dy={secDy}
					/>
				{/if}
			</div>
		</div>
	{/each}

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
	.wx-sections {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
		overflow-x: hidden;
		overflow-y: auto;
	}

	.wx-x-headers-row {
		display: flex;
		flex-shrink: 0;
		position: sticky;
		top: 0;
		z-index: 11;
		background: var(--wx-background);
	}
	.wx-header-corner {
		width: var(--wx-calendar-y-scale-width, 60px);
		flex-shrink: 0;
		border-right: var(--wx-border);
		border-bottom: var(--wx-border);
	}
	.wx-x-headers-area {
		flex: 1;
		min-width: 0;
	}

	.wx-section {
		display: grid;
		grid-template-columns: 1fr;
		overflow: hidden;
		border-bottom: var(--wx-border);
	}
	.wx-section-last {
		border-bottom: none;
	}
	.wx-section.wx-has-y-headers {
		grid-template-columns: auto 1fr;
	}
	.wx-section-sticky {
		position: sticky;
		background: var(--wx-background);
	}
	.wx-section-grid {
		overflow: visible;
		min-height: 0;
	}

	.wx-y-headers-area {
		align-self: stretch;
	}
	.wx-header-spacer {
		width: var(--wx-calendar-y-scale-width, 60px);
		border-right: var(--wx-border);
	}

	.wx-section-content {
		min-width: 0;
		position: relative;
	}

	.wx-sections :global(.wx-dragging),
	.wx-sections :global(.wx-resizing) {
		box-shadow: var(--wx-shadow-light) !important;
		transition: none !important;
		z-index: 100 !important;
		pointer-events: none;
	}
	.wx-sections :global(.wx-dragging) {
		cursor: grabbing !important;
	}

	:global(.wx-drag-stub) {
		display: none;
		position: absolute;
		background: var(--wx-color-primary);
		opacity: 0.3;
		border-radius: var(--wx-border-radius);
		pointer-events: none;
		z-index: 50;
	}
</style>
