<script lang="ts">
	import { getContext } from "svelte";
	import { writable } from "svelte/store";
	import { Calendar, Checkbox } from "@svar-ui/svelte-core";
	import type { CalendarContextApi } from "../types.js";

	type CalendarGroup = {
		id: string | number;
		label: string;
		active?: boolean;
		css?: string;
	};

	type Props = {
		calendars: CalendarGroup[];
		accessor?: string;
		open?: boolean;
		onchange?: (detail: {
			value: (string | number)[];
			filter: ((event: Record<string, any>) => boolean) | null;
		}) => void;
	};

	let {
		calendars,
		accessor = "calendarId",
		open = true,
		onchange,
	}: Props = $props();

	// i18n support with fallback
	const i18n = getContext<any>("wx-i18n");
	const _ = i18n?.getGroup("eventCalendar");

	// Calendar API from context (available when placed inside Calendar widget)
	const calendarApi = getContext<CalendarContextApi>("calendar-api");
	const reactiveState = calendarApi?.getReactiveState();
	const currentDate = reactiveState?.currentDate ?? writable(new Date());
	const visibleDateRange =
		reactiveState?.visibleDateRange ??
		writable({ start: new Date(), end: new Date() });

	const rangeMarkers = $derived.by(() => {
		const range = $visibleDateRange;
		const startTime = range.start.getTime();
		const endTime = range.end.getTime();
		return (date: Date) => {
			const t = date.getTime();
			return t >= startTime && t < endTime ? "wx-view-range" : "";
		};
	});

	let active: Record<string | number, boolean> = $derived.by(() => {
		return calendars.reduce(
			(acc, cal) => {
				acc[cal.id] = cal.active !== false;
				return acc;
			},
			{} as Record<string | number, boolean>
		);
	});

	function applyFilter() {
		const value = [];
		for (const a in active) {
			if (active[a]) value.push(a);
		}

		const filter =
			value.length === calendars.length
				? null
				: (event: Record<string, any>) => active[event[accessor]];

		if (calendarApi) {
			calendarApi.exec("filter-events", {
				filter,
				tag: "calendar-panel",
			});
		}
		onchange?.({ value, filter });
	}

	function toggle(id: string | number) {
		active[id] = !active[id];
		applyFilter();
	}

	$effect(() => {
		if (calendars.some(c => c.active === false)) applyFilter();
	});

	function onDateChange({ value }: { value: Date | null }) {
		if (value && calendarApi) {
			calendarApi.exec("navigate-to", { date: value });
		}
	}
</script>

{#if open}
<div class="wx-calendar-panel">
	<div role="group" aria-label={_("Calendar filters")}>
	{#each calendars as cal (cal.id)}
		<div class="wx-calendar-name {cal.css}">
			<Checkbox
				value={active[cal.id] ?? true}
				onchange={() => toggle(cal.id)}
				/* css={cal.css}
				ariaLabel={cal.label} */
				label={cal.label}
			/>
		</div>
	{/each}
	</div>

	<div class="wx-calendar-panel-bottom">
		<Calendar
			buttons={false}
			value={$currentDate}
			onchange={onDateChange}
			markers={rangeMarkers}
		/>
	</div>
</div>
{/if}

<style>
	.wx-calendar-panel {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: var(--wx-padding);
		overflow: hidden;
	}

	.wx-calendar-panel-toggle {
		background: none;
		border: var(--wx-border);
		cursor: pointer;
		padding: 4px 3px;
		font-size: var(--wx-icon-size);
		line-height: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--wx-color-font);
		flex-shrink: 0;
		border-radius: var(--wx-border-radius);
		outline: none;
	}

	.wx-calendar-panel-toggle:hover {
		background: var(--wx-background-hover);
	}

	.wx-calendar-name {
		margin-top: 4px;
		border: none !important;
		border-radius: var(--wx-border-radius);
		padding: 4px;
	}

	.wx-calendar-panel-color {
		display: inline-block;
		width: 12px;
		height: 12px;
		border-radius: var(--wx-icon-border-radius);
		flex-shrink: 0;
	}

	.wx-calendar-panel-label {
		white-space: nowrap;
		overflow: hidden;
		opacity: 1;
		max-width: 200px;
		transition:
			opacity 0.3s ease,
			max-width 0.3s ease;
	}

	.wx-calendar-panel-bottom :global(.wx-view-range:not(.wx-selected):not(.wx-out)) {
		background: var(--wx-color-primary-selected);
		border-radius: 0;
	}
</style>
