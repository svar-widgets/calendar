<script lang="ts">
    import { getContext } from "svelte";
	import { getData } from "../data.js";
	import {
		Calendar,
		ContextMenu,
		Editor,
		getMenuOptions,
	} from "@svar-ui/svelte-calendar";

	const helpers = getContext("wx-helpers");
	
	const { data, date } = getData();
	let api = $state<any>();

	const options = [
		...getMenuOptions(),
		{ id: "my-action", text: "My action", icon: "wxi-empty" },
	];

	function onclick({ action, context }: any) {
		if (action.id === "my-action"){
		  helpers.showNotice({ text: "`My action` clicked", type: "success" });
		}
	}
</script>

<ContextMenu {api} {options} {onclick}>
	<Calendar bind:this={api} events={data} {date} />
</ContextMenu>
{#if api}<Editor {api} />{/if}
