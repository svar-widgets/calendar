<script lang="ts">
	import { getData } from "../data.js";
	import { Calendar, Editor, getToolbarItems } from "@svar-ui/svelte-calendar";
	import { Layout, Cell } from "@svar-ui/svelte-layout";
	import { Segmented } from "@svar-ui/svelte-core";

	const buttons = getToolbarItems().filter(item => item.id !== "today");
	buttons.find(item => item.id === "modes").comp = "segmented-navigation";

	const { data, date } = getData();
	let api = $state();
	const options = [
		{ id: "mobile", label: "Mobile" },
		{ id: "desktop", label: "Desktop" },
	];

	let size = $state("mobile");
	function setSize({ value }: { value: string }) {
		size = value;
	}
</script>
<div class="responsive">
	<Layout direction="column">
		<Cell height={32} css="toolbar">
			<Segmented {options} onchange={setSize} value={size} />
		</Cell>
		<Cell css="wrapper size-{size}">
			<Calendar
				toolbar={{ items: buttons }}
				bind:this={api}
				events={data}
				{date}
				views={["day", "month", "agenda", "year"]} >
				{#if api}<Editor {api} />{/if}
			</Calendar>
		</Cell>
	</Layout>
</div>

<style>
	.responsive {
		height: 100%;
	}
	.responsive :global(.toolbar) {
		margin: 10px 0 0 10px;
	}
	.responsive :global(.wrapper) {
		border: var(--wx-border);
		border-width: 16px;
		border-radius: 16px;
		margin: 10px;
		box-sizing: border-box;
		flex: 0;
	}
	.responsive :global(.size-mobile) {
		max-width: 480px;
	}
</style>
