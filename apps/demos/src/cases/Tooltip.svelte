<script lang="ts">
	import { getData } from "../data";
	import { Calendar } from "@svar-ui/svelte-calendar";
	import EventTooltip from "../custom/EventTooltip.svelte";

	const { data, date } = getData();
</script>

<Calendar events={data} view="month" {date} tooltip={EventTooltip} />
