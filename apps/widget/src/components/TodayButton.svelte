<script lang="ts">
	import { getContext } from "svelte";
	import type { ILocale } from "@svar-ui/lib-dom";
	import type { CalendarContextApi } from "./types.js";
	import { Button } from "@svar-ui/svelte-core";

	const store = getContext<CalendarContextApi>("calendar-api");
	const _ = getContext<ILocale>("wx-i18n").getGroup("eventCalendar");

	function today() {
		store.exec("navigate-time", { direction: "now" });
	}
</script>

<Button onclick={today}>{_("Today")}</Button>

