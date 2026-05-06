<script lang="ts">
	import { getData } from "../data.js";
	import { Calendar, Editor } from "@svar-ui/svelte-calendar";

	const { data, date } = getData();
	let api = $state();
</script>

<Calendar bind:this={api} events={data} {date} />
{#if api}<Editor {api} />{/if}
