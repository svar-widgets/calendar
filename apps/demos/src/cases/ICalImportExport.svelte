<script lang="ts">
	import { Calendar, Editor, parseICal, serializeICal } from "@svar-ui/svelte-calendar";
	import { Button } from "@svar-ui/svelte-core";
	import { Layout, Cell } from "@svar-ui/svelte-layout";
	import { getData } from "../data.js";

	const { data: initialData, date } = getData();
	let data = $state(initialData);
	let api = $state<any>();
	let fileInput: HTMLInputElement;

	function importIcal(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = ev => {
			data = parseICal(ev.target!.result as string);
		};
		reader.readAsText(file);
	}

	function exportIcal() {
		const events = api.getEvents();
		const ics = serializeICal(events);
		const blob = new Blob([ics], { type: "text/calendar" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "calendar.ics";
		a.click();
		URL.revokeObjectURL(url);
	}

	function clearAll() {
		data = [];
	}
</script>

<Layout>
	<Cell height={52} css="wx-toolbar-2">
		<input
			bind:this={fileInput}
			type="file"
			accept=".ics"
			onchange={importIcal}
			style="display:none"
		/>
		<Button onclick={exportIcal}>Export .ics</Button>
		<Button onclick={clearAll}>Clear all</Button>
		<Button onclick={() => fileInput.click()}>Import .ics</Button>
		
	</Cell>
	<Calendar bind:this={api} events={data} {date} />	
</Layout>
{#if api}<Editor {api} />{/if}

<style>
	:global(.wx-toolbar-2) {
		display: flex;
		gap: 8px;
		padding: 8px;
		border-bottom: 1px solid #ccc;
	}
</style>
