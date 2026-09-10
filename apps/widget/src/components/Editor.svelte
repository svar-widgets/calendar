<script lang="ts">
	import { getContext, setContext, type ComponentProps } from "svelte";
	import { Editor as EditorBase, registerEditorItem } from "@svar-ui/svelte-editor";
	import { locale, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/calendar-locales";
	import { en as coreEn } from "@svar-ui/core-locales";
	import DateTimePicker from "./DateTimePicker.svelte";
	import EventDatesForm from "./EventDatesForm.svelte";
	import { getEditorItems } from "../defaults.js";

	registerEditorItem("date-time-picker", DateTimePicker);
	registerEditorItem("event-dates", EventDatesForm);

	type BaseEditorProps = ComponentProps<typeof EditorBase>;
	type EditorProps = Omit<BaseEditorProps, "values"> & {
		api: any;
		values?: never;
	};
	type EditorChangeEvent = {
		key: string;
		value: any;
		update: Record<string, any>;
		input?: boolean;
	};
	type EditorSaveEvent = {
		changes: (string | number)[];
		values: Record<string, any>;
	};
	type EditorActionEvent = {
		item: Record<string, any>;
		values: Record<string, any>;
		changes: (string | number)[];
	};

	let {
		api,
		values,
		items,
		placement,
		layout = "default",
		focus = true,
		css = "",
		topBar,
		autoSave = true,
		onchange,
		onsave,
		onaction,
		...editorProps
	}: EditorProps = $props();
	// svelte-ignore state_referenced_locally
	void values;

	// svelte-ignore state_referenced_locally
	const { editorData } = api.getReactiveState();

	let l = getContext<ILocale | undefined>("wx-i18n");
	if (!l) {
		l = locale({ ...en, ...coreEn });
		setContext("wx-i18n", l);
	}
	const _ = l.getGroup("eventCalendar");

	function translate(value: any) {
		return typeof value === "string" ? _(value) : value;
	}

	function applyLocale(list: any[]): any[] {
		return list.map(item => {
			const next = { ...item };
			next.label = translate(next.label);
			return next;
		});
	}

	const calendarCtx = getContext<{
		isCompact: () => boolean;
	}>("calendar-api");
	const finalPlacement = $derived(placement ?? (calendarCtx?.isCompact() ? "fullscreen" : "sidebar"));

	const useRecurringForm = $derived(
		!!$editorData?.recurring &&
			($editorData?.recurringMode ?? "series") !== "single"
	);
	const cItems = $derived(
		applyLocale(items ?? getEditorItems(useRecurringForm))
	);

	const defaultTopBar = {
		items: [
			{ comp: "icon", icon: "wxi-close", id: "close" },
			{ comp: "spacer" },
			{
				comp: "button",
				id: "delete",
				text: _("Delete"),
				type: "primary danger",
				onclick: handleDelete,
			},
		],
	};
	const editorTopBar = $derived(topBar === undefined ? defaultTopBar : topBar);
	const editorCss = $derived(
		["wx-editor-calendar", css]
			.filter(Boolean)
			.join(" ")
	);

	function handleSave(ev: EditorSaveEvent) {
		onsave?.(ev);
		const data = $editorData;
		if (!data) return;
		const mode = data.recurringMode ?? "series";
		// a series save must not carry the clicked occurrence's context in
		// rawId, or the store would treat it as a single-occurrence edit
		api.exec("update-event", {
			id: data.id,
			rawId: mode === "series" ? data.id : data.rawId,
			event: { ...ev.values },
			...(data.recurringOriginalDate && mode !== "series" ? { mode } : {}),
		});
	}

	function handleChange(ev: EditorChangeEvent) {
		onchange?.(ev);
	}

	function handleDelete() {
		const data = $editorData;
		if (!data) return;
		api.exec("delete-event", { id: data.id, rawId: data.rawId });
		api.exec("select-event", { id: null, rawId: null });
	}

	function handleAction(ev: EditorActionEvent) {
		onaction?.(ev);
		const { item } = ev;
		if (item.id === "close" && !!item.comp) {
			api.exec("select-event", { id: null, rawId: null });
		}
	}
</script>

{#if $editorData}
	<EditorBase
		{...editorProps}
		{focus}
		items={cItems}
		topBar={editorTopBar}
		{autoSave}
		onchange={handleChange}
		onaction={handleAction}
		onsave={handleSave}
		placement={finalPlacement}
		{layout}
		values={$editorData.values}
		css={editorCss}
	/>
{/if}

<style>
	:global(.wx-sidearea .wx-editor-calendar) {
		width: 450px;
	}
</style>
