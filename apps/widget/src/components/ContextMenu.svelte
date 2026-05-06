<script lang="ts">
	import { getContext, setContext } from "svelte";
	import type { Snippet } from "svelte";
	import { ContextMenu } from "@svar-ui/svelte-menu";
	import { locale, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/calendar-locales";
	import { en as coreEn } from "@svar-ui/core-locales";
	import { getMenuOptions } from "@svar-ui/calendar-store";

	type Props = {
		options?: any[];
		api?: any;
		resolver?: ((event: any, ev: MouseEvent) => any) | null;
		filter?: ((item: any, event: any) => boolean) | null;
		at?: string;
		children?: Snippet;
		onclick?: (e: any) => void;
		css?: string;
	};

	let {
		options = [],
		api = null,
		resolver = null,
		filter = null,
		at = "point",
		children,
		onclick,
		css,
	}: Props = $props();

	let activeId: any = null;

	// set locale
	let l = getContext<ILocale | undefined>("wx-i18n");
	if (!l) {
		l = locale({ ...en, ...coreEn });
		setContext("wx-i18n", l);
	}
	const _ = l.getGroup("eventCalendar");

	function applyLocale(opts: any[]): any[] {
		return opts.map(op => {
			op = { ...op };
			if (op.text) op.text = _(op.text);
			if (op.subtext) op.subtext = _(op.subtext);
			if (op.data) op.data = applyLocale(op.data);
			return op;
		});
	}

	function getOptions() {
		const base = options.length ? options : getMenuOptions();
		return applyLocale(base);
	}

	function itemResolver(rawId: string|number, ev: MouseEvent) {
		if (!rawId || !api) return null;

		const event = api.getEvent(rawId);
		if (!event) return null;

		if (resolver) {
			const result = resolver(event, ev);
			if (!result) return null;
		}

		activeId = event.id;
		return event;
	}

	function menuAction(ev: any) {
		const action = ev?.action;
		if (!action) return;

		const id = typeof activeId === "object" ? activeId.id : activeId;

		if (action.id === "edit-event") {
			api.exec("select-event", { id });
		} else if (action.id === "delete-event") {
			api.exec("delete-event", { id });
		}

		onclick?.(ev);
	}

	function filterMenu(item: any, event: any) {
		return filter ? filter(item, event) : true;
	}

	const cOptions = $derived(getOptions());

	let menu = $state<any>();
	export function show(ev: any, obj?: any) {
		menu.show(ev, obj);
	}
</script>

<ContextMenu
	filter={filterMenu}
	options={cOptions}
	dataKey="id"
	resolver={itemResolver}
	onclick={menuAction}
	{css}
	{at}
	bind:this={menu}
/>
<!-- svelte-ignore a11y_no_static_element_interactions -->
<span oncontextmenu={menu.show} data-menu-ignore="true">
	{@render children?.()}
</span>

<style>
	:global(.wx-menu .wx-option.wx-disabled) {
		pointer-events: none;
	}
	:global(.wx-menu .wx-option.wx-disabled .wx-value),
	:global(.wx-menu .wx-option.wx-disabled .wx-icon) {
		color: var(--wx-color-font-disabled);
	}
</style>
