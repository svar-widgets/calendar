<script lang="ts">
	import { getContext, setContext, type ComponentProps } from "svelte";
	import { Editor as EditorBase, registerEditorItem } from "@svar-ui/svelte-editor";
	import { locale, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/calendar-locales";
	import { en as coreEn } from "@svar-ui/core-locales";
	import DateTimePicker from "./DateTimePicker.svelte";
	import { getEditorItems } from "./editorItems.js";

	registerEditorItem("date-time-picker", DateTimePicker);

	type BaseEditorProps = ComponentProps<typeof EditorBase>;
	type EditorProps = Omit<BaseEditorProps, "values"> & {
		api: any;
		values?: never;
	};
	type EditorChangeEvent = Parameters<NonNullable<BaseEditorProps["onchange"]>>[0];
	type EditorSaveEvent = Parameters<NonNullable<BaseEditorProps["onsave"]>>[0];
	type EditorActionEvent = Parameters<NonNullable<BaseEditorProps["onaction"]>>[0];

	let {
		api,
		values,
		items = getEditorItems(),
		placement = "sidebar",
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

	let generation = $state(1);
	const allDay = $derived(generation > 0 ? $editorData?.allDay : false);
	const cItems = $derived(applyLocale(items));

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
		[
			"wx-editor-calendar",
			allDay ? "wx-editor-all-day" : "",
			css,
		]
			.filter(Boolean)
			.join(" ")
	);

	function handleSave(ev: EditorSaveEvent) {
		onsave?.(ev);
		const data = $editorData;
		if (!data) return;
		api.exec("update-event", { id: data.id, event: { ...ev.values } });
	}

	function sameDay(a: Date, b: Date): boolean {
		return (
			a.getFullYear() === b.getFullYear() &&
			a.getMonth() === b.getMonth() &&
			a.getDate() === b.getDate()
		);
	}

	function handleChange(ev: EditorChangeEvent) {
		const { key, value, update } = ev;
		const prev = $editorData;
		generation++;

		if (prev && key === "start" && !update.allDay) {
			const oldStart = prev.start;
			const oldEnd = prev.end;
			if (
				oldStart instanceof Date &&
				oldEnd instanceof Date &&
				sameDay(oldStart, oldEnd) &&
				value instanceof Date
			) {
				const newEnd = new Date(oldEnd);
				newEnd.setFullYear(
					value.getFullYear(),
					value.getMonth(),
					value.getDate()
				);
				update.end = newEnd;
			}
		}
		onchange?.(ev);
	}

	function handleDelete() {
		const data = $editorData;
		if (!data) return;
		api.exec("delete-event", { id: data.id });
		api.exec("select-event", { id: null });
	}

	function handleAction(ev: EditorActionEvent) {
		onaction?.(ev);
		const { item } = ev;
		if (item.id === "close" && !!item.comp) {
			api.exec("select-event", { id: null });
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
		{placement}
		{layout}
		values={$editorData}
		css={editorCss}
	/>
{/if}

<style>
	:global(.wx-sidearea .wx-editor-calendar) {
		width: 450px;
	}
	:global(.wx-editor-calendar.wx-editor-all-day .wx-timepicker) {
		visibility: hidden;
	}
</style>
