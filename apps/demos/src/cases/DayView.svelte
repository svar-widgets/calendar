<script lang="ts">
	import { Calendar, Editor } from "@svar-ui/svelte-calendar";
	import { Segmented } from "@svar-ui/svelte-core";
	import { Layout } from "@svar-ui/svelte-layout";

	let api = $state();
	let mode = $state("work");

	const modes = [
		{ id: "full", label: "Full day" },
		{ id: "work", label: "Working hours" },
	];

	function at(hour: number, minute = 0) {
		const d = new Date();
		d.setHours(hour, minute, 0, 0);
		return d;
	}

	const events = [
		{ id: 1, text: "Standup", start: at(9, 0), end: at(10, 15) },
		{ id: 2, text: "Design review", start: at(11, 0), end: at(12, 30) },
		{ id: 3, text: "Sprint planning", start: at(14, 0), end: at(15, 30) },
	];

	const views = $derived([
		{
			id: "day",
			sections: {
				timeGrid: {
					yScale: {
						startHour: mode === "work" ? 8 : 0,
						endHour: mode === "work" ? 18 : 24,
						step: mode === "work" ? 60 : 120,
						ui: { minUnitHeight: 40 },
					},
					ui: { nowLine: true },
				},
			},
		},
	]);
</script>

<Layout preset="space">
	<Segmented
		options={modes}
		value={mode}
		onchange={v => (mode = v.value as string)} />
	<Calendar
		bind:this={api}
		{events}
		view="day"
		date={new Date()}
		{views} />
</Layout>

{#if api}
	<Editor {api} />
{/if}
