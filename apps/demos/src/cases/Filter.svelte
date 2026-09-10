<script lang="ts">
    import { getContext } from "svelte";
	import { getData } from "../data";
	import { Calendar } from "@svar-ui/svelte-calendar";
	import { Segmented } from "@svar-ui/svelte-core";
	import { Layout, Cell } from "@svar-ui/svelte-layout";
	import { Willow, WillowDark, FilterQuery, FilterBar, FilterBuilder, createFilter, getQueryString } from "@svar-ui/svelte-filter";

	const { data, date } = getData();
	const helpers = getContext<any>("wx-helpers");

	let api: any;
	let mode = $state("plain");
	let textValue = $state("");

	function onInit(obj: any) {
		api = obj;
	}
	
	const fields = [
		{
			id: "text",
			label: "Text",
			type: "text",
		},
		{
			id: "start",
			label: "Start Date",
			type: "date",
		},
		{
			id: "end",
			label: "End Date",
			type: "date",
		},
	];
	
	const url =
		"https://filter-backend.svar.dev/text-to-json";
	async function text2filter(text: string, fields: unknown) {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify({ text, fields }),
		});
		const json = await response.json();
		if (!response.ok) {
			helpers.showNotice({
				text: json.error || "Request failed",
				type: "danger",
			});
			return null;
		}
		return json;
	}

	async function applyQueryFilter({
		value,
		error,
		text,
		startProgress,
		endProgress,
	}: {
		value: any;
		error?: any;
		text: string;
		startProgress: () => void;
		endProgress: () => void;
	}) {
		if (text) {
			error = null;
			try {
				startProgress();
				value = await text2filter(text, fields);
				textValue = value ? getQueryString(value).query : "";
			} catch (e) {
				error = e;
			} finally {
				endProgress();
			}
		}

		if (error) {
			helpers.showNotice({
				text: error.message,
				type: "danger",
			});

			if (error.code !== "NO_DATA") return;
		}

		api.exec("filter-events", { filter: createFilter(value, {}, fields) });
	}

	function applyFilter({ value }: { value: any }){
	  api.exec("filter-events", { filter: createFilter(value) });
	}
</script>

<Willow />
<WillowDark />
	
<Layout preset="space">
    <Segmented bind:value={mode} options={[
        { id:"plain", label:"Plain" },
        { id:"query", label:"Query" },
        { id:"builder", label:"Builder" }
    ]} />
    {#if mode === "plain"}
    <FilterBar debounce={0} fields={[ fields[0] ]} onchange={applyFilter} />
    {:else if mode === "query"}
    <FilterQuery value={textValue} {fields} onchange={applyQueryFilter} placeholder="type your query as plain text" />
    {:else if mode === "builder"}
    <FilterBuilder {fields} type={"line"} onchange={applyFilter} />
    {/if}
    
	<Cell>
		<Calendar events={data} {date} init={onInit} />
	</Cell>
</Layout>

<style>
	:global(.wx-filter-bar){
	    width: 100% !important;
	}
</style>
