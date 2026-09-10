<script lang="ts">
	import { getContext } from "svelte";
	import type { CalendarContextApi } from "../types.js";
	import { Button } from "@svar-ui/svelte-core";

	const store = getContext("calendar-api") as CalendarContextApi;

	function addEvent() {
		store.exec("add-event", { event: {}, edit: true });
	}
</script>

<Button icon="wxi-plus" type="primary" onclick={addEvent}></Button>
