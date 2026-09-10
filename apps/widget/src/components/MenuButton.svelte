<script lang="ts">
	import { getContext } from "svelte";
	import type { CalendarContextApi } from "../types.js";
	import { Button } from "@svar-ui/svelte-core";

	const store = getContext<CalendarContextApi>("calendar-api");

	function menuClick() {
		(store.exec as (a: string, d: any) => void)("action", {
			id: "menu-button",
		});
	}
</script>

<Button icon="wxi-menu" onclick={menuClick} /*ariaLabel={_("Menu")}*/ />