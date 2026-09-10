<script lang="ts">
	import { getData } from "../data.js";
	import { Calendar, getToolbarItems } from "@svar-ui/svelte-calendar";
	import { Layout } from "@svar-ui/svelte-layout";
	import { Segmented } from "@svar-ui/svelte-core";
	
	
	const { data, date } = getData();
		
	const defaultConfig = { items: getToolbarItems() };

	const invertedConfig = { items:[
		{ id: "modes", comp: "segmented" },
		{ comp: "spacer" },
		{ id: "title", comp: "dateLabel" },
		{ id: "nav", comp: "dateNav" },
	]};

	const sidesConfig = { items:[
		{ id: "nav", comp: "dateNav" },
		{ id: "title", comp: "dateLabel" },
		{ comp: "spacer" },
		{ id: "modes", comp: "segmented" },
	]};

	const minimalConfig = { items:[
		{ comp: "spacer" },
		{ id: "modes", comp: "segmented" },
	]};

	const noneConfig = { items:[]};

	let mode = $state("default");
	const modes = [
		{ id: "default", label: "Default", config: defaultConfig },
		{ id: "sides", label: "Sides", config: sidesConfig },
		{ id: "inverted", label: "Inverted", config: invertedConfig },
		{ id: "minimal", label: "Minimal", config: minimalConfig },
		{ id: "none", label: "None", config: noneConfig },
	];

	const toolbar = $derived(modes.find(m => m.id === mode)?.config);
</script>

<Layout direction="column">
	<Segmented options={modes} value={mode} onchange={v => mode = v.value as string} />
	<Calendar events={data} {date} {toolbar} />
</Layout>
