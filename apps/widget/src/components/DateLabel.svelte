<script lang="ts">
	import { getContext } from "svelte";
	import type { CalendarContextApi } from "../types.js";

	const store = getContext("calendar-api") as CalendarContextApi;
	const { rangeLabel } = store.getReactiveState();
</script>

<span class="wx-date-label" role="heading" aria-level="2" aria-live="polite" aria-atomic="true">{$rangeLabel}</span>

<style>
	.wx-date-label {
		font-size: var(--wx-font-size-hd);
		flex-grow: 1;
	}
</style>
