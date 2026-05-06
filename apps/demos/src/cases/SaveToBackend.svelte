<script lang="ts">
	import { Calendar, Editor } from "@svar-ui/svelte-calendar";
	import { RestDataProvider } from "../../../../packages/provider/src/index.js";

	const server = "https://calendar-backend.svar.dev";
	const provider = new RestDataProvider(server);

	let api = $state<any>();
	let data = $state<any[]>([]);
	let date = $state<any>(new Date());

	provider.getData().then(events => {
		data = events;
		date = new Date(events[0].start);
	});

	function init(api: any) {
		api.setNext(provider);
	}
</script>

<Calendar bind:this={api} {init} events={data} {date} />
{#if api}<Editor {api} />{/if}
