<script lang="ts">
	import { getContext } from "svelte";
	import type { ILocale } from "@svar-ui/lib-dom";
	import type { CalendarContextApi } from "../types.js";
	import { Button } from "@svar-ui/svelte-core";

	const store = getContext<CalendarContextApi>("calendar-api");
	const _ = getContext<ILocale>("wx-i18n").getGroup("eventCalendar");

	function next() {
		store.exec("navigate-time", { direction: "next" });
	}

	function prev() {
		store.exec("navigate-time", { direction: "previous" });
	}
</script>

<div class="wx-date-nav" role="group" aria-label={_("Date navigation")}>
	<Button icon="wxi-angle-left" onclick={prev} /*ariaLabel={_("Previous period")}*/ />
	<Button icon="wxi-angle-right" onclick={next} /*ariaLabel={_("Next period")}*/ />
</div>

<style>
	.wx-date-nav {
		display: flex;
		align-items: center;
	}
	.wx-date-nav :global(button:first-child) {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}
	.wx-date-nav :global(button:last-child) {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}
</style>
