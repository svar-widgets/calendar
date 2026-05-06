<script lang="ts">
	import type { CalendarContextApi } from "./types.js";
	import type { ILocale } from "@svar-ui/lib-dom";
	import { getContext } from "svelte";
	import { Toolbar, registerToolbarItem } from "@svar-ui/svelte-toolbar";
	import { RichSelect, Segmented } from "@svar-ui/svelte-core";
	import { getToolbarItems } from "@svar-ui/calendar-store";
	import type { ToolbarItem } from "@svar-ui/calendar-store";
	import DateNav from "./DateNav.svelte";
	import TodayButton from "./TodayButton.svelte";
	import DateLabel from "./DateLabel.svelte";
	import MenuButton from "./MenuButton.svelte";
	import AddEventButton from "./AddEventButton.svelte";

	registerToolbarItem("richselect", RichSelect)
	registerToolbarItem("segmented", Segmented);
	registerToolbarItem("dateNav", DateNav);
	registerToolbarItem("todayButton", TodayButton);
	registerToolbarItem("dateLabel", DateLabel);
	registerToolbarItem("menuButton", MenuButton);
	registerToolbarItem("addEventButton", AddEventButton);

	const store = getContext<CalendarContextApi>("calendar-api");

	const { views, toolbar = { items: getToolbarItems() }, readonly = false }: { views: any; toolbar?: { items?: ToolbarItem[] , css?: string }; readonly?: boolean } = $props();
	const { currentView } = store.getReactiveState();

	const _ = getContext<ILocale>("wx-i18n").getGroup("eventCalendar");

	const items = $derived.by(() => {
		const base = toolbar?.items;
		const viewOptions: { id: string; label: string }[] = views.map((v: any) => ({
			id: v.id,
			label: _(v.label || v.id.charAt(0).toUpperCase() + v.id.slice(1)),
		}));

		const res = [...(base ?? [])].map((item: ToolbarItem) => {
			if (item.id === "modes") {
				if (viewOptions.length > 1) {
					return {
						...item,
						value: $currentView,
						options: viewOptions,
					};
				} else {
					return null;
				}
			}
			if (readonly && item.comp === "addEventButton") return null;
			return item;
		}).filter(Boolean);
		return res as ToolbarItem[];
	});

	const onchange = ({ item, value }: { item: any; value: string }) => {
		if (item.id === "modes") {
			store.exec("navigate-to", { view: value });
		}
	};
</script>

<div class="wx-navigation" role="navigation" aria-label={_("Calendar controls")}>
	<Toolbar {items} {onchange} css={toolbar?.css}></Toolbar>
</div>

<style>
	.wx-navigation {
		border-bottom: var(--wx-border);
	}
</style>
