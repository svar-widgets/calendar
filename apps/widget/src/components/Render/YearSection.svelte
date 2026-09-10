<script lang="ts">
	import { getContext } from "svelte";
	import type { ILocale } from "@svar-ui/lib-dom";
	import type { CalendarEvent, SectionResult } from "@svar-ui/calendar-store";
	import { Popup } from "@svar-ui/svelte-core";

	const _ = getContext<ILocale>("wx-i18n").getGroup("eventCalendar");

	const { section, tooltip: TooltipCmp, eventContent } = $props<{
		section: SectionResult;
		tooltip?: any;
		eventContent?: any;
	}>();

	interface MonthData {
		label: string;
		month: number;
		year: number;
		startOffset: number;
		totalDays: number;
		today?: number;
		markedDays: Record<number, CalendarEvent[]>;
	}

	interface DayCell {
		day: number;
		empty: boolean;
		today: boolean;
		weekend: boolean;
		hasEvents: boolean;
		events: CalendarEvent[];
	}

	const columns: number = $derived(section.ui?.columns ?? 3);
	const weekStartDay: number = $derived(section.ui?.weekStartDay ?? 1);
	const months: MonthData[] = $derived(section.ui?.months ?? []);
	const weekdayBase = ["S", "M", "T", "W", "T", "F", "S"];
	const weekdays = $derived.by(() => {
		const shift = ((weekStartDay % 7) + 7) % 7;
		const ordered: { label: string; weekend: boolean }[] = [];
		for (let i = 0; i < 7; i++) {
			const dow = (i + shift) % 7;
			ordered.push({
				label: weekdayBase[dow],
				weekend: dow === 0 || dow === 6,
			});
		}
		return ordered;
	});

	function dateStr(year: number, month: number, day: number): string {
		return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
	}

	function getDays(month: MonthData): DayCell[] {
		const days: DayCell[] = [];
		for (let i = 0; i < month.startOffset; i++) {
			days.push({
				day: 0,
				empty: true,
				today: false,
				weekend: false,
				hasEvents: false,
				events: [],
			});
		}
		for (let d = 1; d <= month.totalDays; d++) {
			const events = month.markedDays[d] || [];
			const dow = new Date(month.year, month.month, d).getDay();
			days.push({
				day: d,
				empty: false,
				today: month.today === d,
				weekend: dow === 0 || dow === 6,
				hasEvents: events.length > 0,
				events,
			});
		}
		return days;
	}

	let tooltipData = $state<{
		element: HTMLElement;
		events: CalendarEvent[];
	} | null>(null);

	function showTooltip(e: MouseEvent, events: CalendarEvent[]) {
		tooltipData = {
			element: e.currentTarget as HTMLElement,
			events,
		};
	}

	function hideTooltip() {
		tooltipData = null;
	}

	function formatTime(date: Date): string {
		return date.toLocaleTimeString(undefined, {
			hour: "2-digit",
			minute: "2-digit",
		});
	}

	function formatRange(event: CalendarEvent): string {
		const { start, end } = event;
		if (
			event.allDay ||
			start.getFullYear() !== end.getFullYear() ||
			start.getMonth() !== end.getMonth() ||
			start.getDate() !== end.getDate()
		) {
			return _("Full day");
		}
		return `${formatTime(start)} – ${formatTime(end)}`;
	}

	function eventTitle(event: CalendarEvent): string {
		return event.text || "";
	}
</script>

<div
	class="wx-year-grid"
	style="--wx-year-columns: {columns}"
>
	{#each months as month (month.month)}
		<div class="wx-year-month">
			<div class="wx-month-label">{month.label}</div>
			<div class="wx-month-grid">
				{#each weekdays as wd}
					<div class="wx-weekday-header" class:wx-weekend={wd.weekend}>
						{wd.label}
					</div>
				{/each}
				{#each getDays(month) as day}
					{#if day.empty}
						<div class="wx-month-day wx-empty"></div>
					{:else}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="wx-month-day"
							class:wx-today={day.today}
							class:wx-weekend={day.weekend}
							class:wx-has-events={day.hasEvents}
							data-date={dateStr(month.year, month.month, day.day)}
							aria-current={day.today ? "date" : undefined}
							onmouseenter={day.hasEvents
								? e => showTooltip(e, day.events)
								: undefined}
							onmouseleave={day.hasEvents
								? hideTooltip
								: undefined}
						>
							<span class="wx-day-num">{day.day}</span>
							{#if day.hasEvents}
								<span class="wx-event-dot" aria-hidden="true"></span>
							{/if}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	{/each}
</div>

{#if tooltipData}
	<Popup
		parent={tooltipData.element}
		at="bottom-start"
		oncancel={hideTooltip}
	>
		<div
			class="wx-year-tooltip"
			class:wx-year-tooltip-custom={!!TooltipCmp}
		>
			{#if TooltipCmp}
				<TooltipCmp events={tooltipData.events} />
			{:else}
				{#each tooltipData.events as ev}
					<div class="wx-tooltip-event">
						{#if eventContent}
							{@const EventContentCmp = eventContent}
							<div class="wx-tooltip-event-content">
								<EventContentCmp event={ev} mode="year-tooltip" />
							</div>
						{:else}
							<span class="wx-tooltip-time">
								{formatRange(ev)}
							</span>
							<span class="wx-tooltip-title">{eventTitle(ev)}</span>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</Popup>
{/if}

<style>
	.wx-year-grid {
		display: grid;
		grid-template-columns: repeat(var(--wx-year-columns, 3), 1fr);
		gap: 16px;
		padding: 16px;
		position: relative;
	}
	:global(.wx-calendar--compact) {
		.wx-year-grid {
			display: flex;
			flex-direction: column;
		}
	}
	.wx-month-label {
		font-weight: var(--wx-font-weight-md);
		margin-bottom: 4px;
		padding-left: 20px;
	}
	.wx-month-grid {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 1px;
	}
	.wx-weekday-header {
		text-align: center;
		font-size: 10px;
		color: var(--wx-color-font-alt);
		padding: 2px 0;
	}
	.wx-month-day {
		text-align: center;
		padding: 2px;
		position: relative;
		min-height: 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
		cursor: default;
		color: var(--wx-color-font-alt);
	}
	.wx-month-day.wx-weekend,
	.wx-weekday-header.wx-weekend {
		background-color: var(--wx-calendar-weekend-background);
	}
	.wx-month-day.wx-has-events {
		cursor: pointer;
		color: var(--wx-color-font);
	}
	.wx-day-num {
		font-size: 13px;
	}
	.wx-month-day.wx-today .wx-day-num {
		background: var(--wx-color-primary);
		color: var(--wx-color-primary-font);
		border-radius: 50%;
		width: 20px;
		height: 20px;
		line-height: 20px;
		display: inline-block;
	}
	.wx-event-dot {
		display: block;
		width: 4px;
		height: 4px;
		border-radius: 50%;
		background: var(--wx-color-primary);
		margin-top: 1px;
	}
	.wx-year-tooltip {
		background: var(--wx-background);
		border: var(--wx-border);
		border-radius: var(--wx-border-radius);
		padding: 8px 12px;
		box-shadow: var(--wx-shadow-light);
		min-width: 150px;
		max-width: 300px;
	}
	.wx-year-tooltip-custom {
		padding: 0;
		border: none;
		background: none;
		box-shadow: none;
		min-width: 0;
		max-width: none;
	}
	.wx-tooltip-event {
		display: flex;
		align-items: center;
		padding: 2px 0;
		font-size: var(--wx-font-size-sm);
	}
	.wx-tooltip-event + .wx-tooltip-event {
		border-top: var(--wx-border);
		padding-top: 4px;
		margin-top: 2px;
	}
	.wx-tooltip-time {
		flex-shrink: 0;
		color: var(--wx-color-font-alt);
		margin-right: 8px;
	}
	.wx-tooltip-title {
		color: var(--wx-color-font);
	}
	.wx-tooltip-event-content {
		flex: 1;
		min-width: 0;
	}
</style>
