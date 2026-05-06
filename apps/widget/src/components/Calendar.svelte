<script lang="ts">
	// svelte core
	import type { Snippet } from "svelte";
	import { setContext, getContext } from "svelte";
	import { writable } from "svelte/store";

	// locales
	import { locale as l, dateToString, type ILocale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/calendar-locales";
	import { en as coreEn } from "@svar-ui/core-locales";

	// stores
	import { EventBusRouter } from "@svar-ui/lib-state";
	import { CalendarStore } from "@svar-ui/calendar-store";
	import type { ViewConfig } from "@svar-ui/calendar-store";
	import type { CalendarContextApi, CalendarInstanceApi } from "./types.js";
	import type { ToolbarItem, CellCss, EventCss } from "@svar-ui/calendar-store";

	// ui
	import Layout from "./Layout.svelte";

	// incoming parameters
	type Props = {
		events: any;
		init?: (api: CalendarInstanceApi) => void;
		readonly?: boolean;
		view?: string;
		views?: (string | ViewConfig)[];
		toolbar?: { items?: ToolbarItem[] , css?: string } | null;
		cellCss?: CellCss;
		eventCss?: EventCss;
		eventContent?: any;
		date?: Date;
		recurring?: boolean;
		children?: Snippet;
		tooltip?: any;
		eventPopup?: any;
	};

	let {
		events,
		init,
		view = "day",
		date,
		views = ["day", "week", "month"],
		toolbar,
		cellCss,
		eventCss,
		eventContent,
		recurring = false,
		readonly = false,
		children,
		tooltip,
		eventPopup,
		...restProps
	}: Props = $props();

	// uses same logic as the Locale component
	const words = { ...coreEn, ...en };
	let locale = getContext<ILocale | undefined>("wx-i18n");
	if (!locale) locale = l(words);
	else locale = locale.extend(words, true);
	setContext("wx-i18n", locale);

	// create date format helper that resolves format names and format strings
	const rawLocale: any = locale.getRaw();
	const fmt = (format: string) => {
		const resolved = rawLocale?.eventCalendar?.[format] ?? format;
		return dateToString(resolved, rawLocale?.calendar);
	};

	// init stores
	// svelte-ignore state_referenced_locally
	const dataStore = new CalendarStore(writable, {
		recurring,
		weekStart: rawLocale?.calendar?.weekStart ?? 1,
		dateFormat: fmt,
	});

	// define event route
	let firstInRoute = dataStore.in;

	const dash = /-/g;
	let lastInRoute: any = new EventBusRouter((a: string, b: any) => {
		const name = "on" + a.replace(dash, "");
		const handler = (restProps as Record<string, (e: any) => void>)[name];
		if (handler) {
			handler(b);
		}
	});
	firstInRoute.setNext(lastInRoute);

	// public API
	export const // state
		getState = dataStore.getState.bind(dataStore),
		getReactiveState = dataStore.getReactive.bind(dataStore),
		getStores = () => ({ data: dataStore }),
		getEvents = dataStore.getEvents.bind(dataStore),
		getEvent = dataStore.getEvent.bind(dataStore),
		// events
		exec = firstInRoute.exec,
		setNext = (ev: any) => (lastInRoute = lastInRoute.setNext(ev)),
		intercept = firstInRoute.intercept.bind(firstInRoute),
		on = firstInRoute.on.bind(firstInRoute),
		detach = firstInRoute.detach.bind(firstInRoute);
	// extra api

	const api: CalendarInstanceApi = {
		exec,
		setNext,
		intercept,
		on,
		detach,
		getState,
		getReactiveState,
		getStores,
		getEvents,
		getEvent,
		fmt,
	};

	const viewOptions: ViewConfig[] = $derived(
		views.map(v => {
			if (typeof v === "string") {
				return { id: v };
			}
			return { ...v };
		})
	);

	// common API available in components
	const stateStore = {
		getState,
		getReactiveState,
		exec,
		getEvent,
		fmt,
	} as CalendarContextApi;
	setContext("calendar-api", stateStore);

	let init_once = true;
	const reinitStore = () => {
		dataStore.configureViews(viewOptions);
		dataStore.init({
			currentView: view,
			currentDate: date,
			events,
		});

		if (init_once && init) {
			init(api);
			init_once = false;
		}
	};

	reinitStore();
	$effect(reinitStore);
</script>

<Layout
	store={stateStore}
	views={viewOptions}
	brandmark={dataStore.getBrandmark() ?? undefined}
	{toolbar}
	{cellCss}
	{eventCss}
	{eventContent}
	{children}
	{tooltip}
	{eventPopup}
	{readonly}
/>
