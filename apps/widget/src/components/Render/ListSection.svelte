<script lang="ts">
	import { getContext } from "svelte";
	import {setID} from "@svar-ui/lib-dom";
	import type { ILocale } from "@svar-ui/lib-dom";
	import type { CalendarEvent, Primitive } from "@svar-ui/calendar-store";
	import type { CalendarContextApi } from "../types.js";

	const { primitives, eventContent } = $props<{
		primitives: Primitive[];
		eventContent?: any;
	}>();

	const api = getContext<CalendarContextApi>("calendar-api");
	const _ = getContext<ILocale>("wx-i18n").getGroup("eventCalendar");
	const fmtDate = api.fmt("agendaDayFormat");
	const fmtTime = api.fmt("timeScaleFormat");

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
		return `${fmtTime(start)} – ${fmtTime(end)}`;
	}

	interface DayGroup {
		date: Date;
		label: string;
		events: Primitive[];
	}

	const groups: DayGroup[] = $derived.by(() => {
		const map = new Map<string, DayGroup>();
		for (const p of primitives) {
			const d = p.event.start;
			const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
			let group = map.get(key);
			if (!group) {
				const date = new Date(
					d.getFullYear(),
					d.getMonth(),
					d.getDate()
				);
				group = {
					date,
					label: fmtDate(date),
					events: [],
				};
				map.set(key, group);
			}
			group.events.push(p);
		}
		return Array.from(map.values());
	});

</script>

<div class="wx-list-section">
	{#each groups as group (group.date.getTime())}
		<div class="wx-list-day">
			<div class="wx-list-date">{group.label}</div>
			<div class="wx-list-events">
				{#each group.events as p (p.id)}
					<div
						class="wx-list-event"
						data-id={setID(p.id)}
					>
						{#if eventContent}
							{@const EventContentCmp = eventContent}
							<div class="wx-list-event-content">
								<EventContentCmp event={p.event} mode="list" />
							</div>
						{:else}
							<span class="wx-event-time">
								{formatRange(p.event)}
							</span>
							<span class="wx-event-title">
								{p.event.text || ""}
							</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/each}
	{#if groups.length === 0}
		<div class="wx-list-empty" role="status">No events this month</div>
	{/if}
</div>

<style>
	.wx-list-section {
		padding: 8px 0;
	}
	.wx-list-day {
		margin-bottom: 4px;
	}
	.wx-list-date {
		padding: 8px 16px;
		font-weight: var(--wx-font-weight-md);
		border-bottom: var(--wx-border);
		background: var(--wx-background-alt);
	}
	.wx-list-event {
		display: flex;
		align-items: center;
		padding: 8px 16px 8px 32px;
		border-bottom: var(--wx-border);
		cursor: pointer;
	}
	.wx-list-event:hover {
		background-color: var(--wx-background-hover);
	}
	.wx-event-time {
		flex-shrink: 0;
		width: 130px;
		font-size: 13px;
		color: var(--wx-color-font-alt);
	}
	.wx-event-title {
		font-size: var(--wx-font-size);
	}
	.wx-list-event-content {
		flex: 1;
		min-width: 0;
	}
	.wx-list-empty {
		padding: 32px 16px;
		text-align: center;
		color: var(--wx-color-font-alt);
	}
</style>
