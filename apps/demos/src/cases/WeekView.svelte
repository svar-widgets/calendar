<script lang="ts">
	import { getData } from "../data";
	import { Calendar, Editor, WeekViewModel, registerCalendarView, getToolbarItems } from "@svar-ui/svelte-calendar";
	import { Checkbox, Locale } from "@svar-ui/svelte-core";
	import { Layout } from "@svar-ui/svelte-layout";
	
	class WorkWeekViewModel extends WeekViewModel {
		getSections() {
			const sections = super.getSections();
			return sections.map(s => ({
				...s,
				xScale: { ...s.xScale, length: 5 },
			}));
		}

		rangeStart(date: Date): Date {
			const d = new Date(date);
			d.setHours(0, 0, 0, 0);
			// work week is Mon–Fri regardless of locale's weekStart
			const diff = (((d.getDay() - 1) % 7) + 7) % 7;
			d.setDate(d.getDate() - diff);
			return d;
		}
	}

	class TwoWeeksViewModel extends WeekViewModel {
		getSections() {
			const sections = super.getSections();
			const days = sections[1];
			return [
				{
					...days,
					xScale: { ...days.xScale, length: 14 },
					boxLayout: "overlap",
				},
			];
		}

		getRangeLabel(): string {
			const opts: Intl.DateTimeFormatOptions = {
				month: "short",
				day: "numeric",
			};
			const start = this["startDate"];
			const end = new Date(this["endDate"].getTime() - 1);
			if (start.getMonth() === end.getMonth()) {
				return `${start.toLocaleDateString(undefined, { month: "long" })} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
			}
			return `${start.toLocaleDateString(undefined, opts)} – ${end.toLocaleDateString(undefined, opts)}, ${end.getFullYear()}`;
		}

		addRange(date: Date, n: number): Date {
			const d = new Date(date);
			d.setDate(d.getDate() + n * 14);
			return d;
		}
	}

	registerCalendarView("workweek", WorkWeekViewModel);
	registerCalendarView("2weeks", TwoWeeksViewModel);

	const { data, date } = getData();
	let api = $state();
	let sundayStart = $state(false);

	const weekStart = $derived(sundayStart ? 0 : 1);
	const words = $derived({ calendar: { weekStart } });

	const toolbar = {
		items: getToolbarItems()
			.filter(item => item.id !== "add-event")
			.map(item =>
				item.id === "modes" ? { ...item, comp: "segmented" } : item
			),
	};

	const views = [
		{ id: "week", label: "Week" },
		{ id: "workweek", label: "Work Week" },
		{ id: "2weeks", label: "2 Weeks" },
	];
</script>

<Layout preset="space">
	<Checkbox label={"Start week on Sunday"} bind:value={sundayStart}></Checkbox>

	{#key weekStart}
		<Locale {words}>
			<Calendar
				bind:this={api}
				events={data}
				view="week"
				{date}
				{views}
				{toolbar} />
		</Locale>
	{/key}
</Layout>

{#if api}
	<Editor {api} />
{/if}

