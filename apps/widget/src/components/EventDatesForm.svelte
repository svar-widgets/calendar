<script lang="ts">
	import { getContext, setContext } from "svelte";
	import { Checkbox, DatePicker, TimePicker } from "@svar-ui/svelte-core";
	import type { ILocale } from "@svar-ui/lib-dom";

	const locale = getContext<ILocale>("wx-i18n");
	const _ = locale ? locale.getGroup("eventCalendar") : (v:string) => v;

	type Value = {
		start: Date;
		end: Date;
		allDay?: boolean;
	};

	let {
		value,
		error,
		onchange,
	}: {
		value: Value;
		error?: unknown;
		onchange: (ev: { value: Value }) => void;
	} = $props();

	setContext("wx-input-id", "");

	function sameDay(a: Date, b: Date): boolean {
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		);
	}

	function update(part: Partial<Value>) {
		onchange({ value: { ...value, ...part } });
	}

	function pickDate(key: "start" | "end", day: Date | null) {
		if (!day) return;
		const current = value[key];
		const next = new Date(day);
		if (current) {
			next.setHours(current.getHours(), current.getMinutes(), 0, 0);
		}

		if (key === "start" && sameDay(value.start, value.end)) {
			const end = new Date(value.end);
			end.setFullYear(next.getFullYear(), next.getMonth(), next.getDate());
			update({ start: next, end });
		} else {
			update({ [key]: next });
		}
	}

	function pickTime(key: "start" | "end", time: Date) {
		const next = new Date(value[key]);
		next.setHours(time.getHours(), time.getMinutes(), 0, 0);
		update({ [key]: next });
	}
</script>

<div class="wx-event-dates" class:wx-error={!!error}>
	<div class="wx-date-row">
		<span class="wx-date-label">{_("Start date")}</span>
		<div class="wx-date-control">
			<DatePicker
				value={value.start}
				buttons={false}
				onchange={ev => pickDate("start", ev.value)}
			/>
		</div>
		{#if !value.allDay}
			<div class="wx-time-control">
				<TimePicker
					value={value.start}
					onchange={ev => pickTime("start", ev.value)}
				/>
			</div>
		{/if}
	</div>

	<div class="wx-date-row">
		<span class="wx-date-label">{_("End date")}</span>
		<div class="wx-date-control">
			<DatePicker
				value={value.end}
				buttons={false}
				onchange={ev => pickDate("end", ev.value)}
			/>
		</div>
		{#if !value.allDay}
			<div class="wx-time-control">
				<TimePicker
					value={value.end}
					onchange={ev => pickTime("end", ev.value)}
				/>
			</div>
		{/if}
	</div>

	<div class="wx-date-row">
		<span class="wx-date-label"></span>
		<Checkbox
			label={_("All day")}
			value={!!value.allDay}
			onchange={ev => update({ allDay: ev.value })}
		/>
	</div>
</div>

<style>
	.wx-event-dates {
		display: flex;
		flex-direction: column;
		gap: var(--wx-padding);
	}

	.wx-date-row {
		display: flex;
		align-items: center;
		gap: var(--wx-padding);
	}

	.wx-date-label {
		flex: none;
		width: 72px;
	}

	.wx-date-control {
		flex: 1;
		min-width: 0;
	}

	.wx-time-control {
		flex: none;
		width: 96px;
	}

	.wx-error :global(.wx-input) {
		border-color: var(--wx-color-danger);
	}
</style>
