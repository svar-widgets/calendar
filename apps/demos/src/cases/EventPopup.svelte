<script lang="ts">
	import { getData } from "../data";
	import { Calendar } from "@svar-ui/svelte-calendar";
	import EventPopup from "../custom/EventPopup.svelte";


	const { data } = getData();

</script>

<Calendar
	events={data}
	view="week"
	eventPopup={EventPopup}
	views={["day", "week", "month"]}
/>
