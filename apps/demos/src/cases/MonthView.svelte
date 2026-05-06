<script lang="ts">
	import { getData } from "../data";
	import { Calendar, Editor } from "@svar-ui/svelte-calendar";
	import { Checkbox, Locale } from "@svar-ui/svelte-core";
	import { Layout } from "@svar-ui/svelte-layout";

	const { data, date } = getData();
	let wNumbers = $state(false);
	let sundayStart = $state(false);
	let api = $state();

	const weekStart = $derived(sundayStart ? 0 : 1);
	const words = $derived({ calendar: { weekStart } });

	const views = $derived([
		{
			id: "month",
			sections: {
				month: {
					yScale: {
						visible: wNumbers,
						format: wNumbers ? "weekNumberFormat" : undefined,
					},
				},
			},
		},
	]);
</script>

<Layout preset="space">
	<Checkbox label={"Week numbers"} bind:value={wNumbers}></Checkbox>
	<Checkbox label={"Start week on Sunday"} bind:value={sundayStart}></Checkbox>

	{#key weekStart}
		<Locale {words}>
			<Calendar
				bind:this={api}
				events={data}
				view="month"
				{date}
				{views} />
		</Locale>
	{/key}
</Layout>

{#if api}
	<Editor {api} />
{/if}