<script lang="ts">
	import { Calendar, CalendarPanel } from "@svar-ui/svelte-calendar";
	import { relDate } from "../data.js";

	const date = relDate(0);

	const calendars = [
		{ id: "work", label: "Work", css: "cal-work" },
		{ id: "home", label: "Home", css: "cal-home" },
		{ id: "holiday", label: "Holidays", css: "cal-holiday", active: false },
	];

	const data = [
		{
			id: 1,
			text: "Team Standup",
			start: relDate(0, 9, 0),
			end: relDate(0, 9, 30),
			calendarId: "work",
		},
		{
			id: 2,
			text: "Sprint Review",
			start: relDate(0, 14, 0),
			end: relDate(0, 15, 0),
			calendarId: "work",
		},
		{
			id: 3,
			text: "Gym",
			start: relDate(0, 8, 0),
			end: relDate(0, 8, 30),
			calendarId: "home",
		},
		{
			id: 4,
			text: "Dentist",
			start: relDate(1, 10, 0),
			end: relDate(1, 11, 0),
			calendarId: "home",
		},
		{
			id: 5,
			text: "Music Festival",
			start: relDate(5),
			end: relDate(6),
			calendarId: "holiday",
		},
		{
			id: 6,
			text: "Design Sync",
			start: relDate(2, 11, 0),
			end: relDate(2, 12, 0),
			calendarId: "work",
		},
		{
			id: 7,
			text: "Gym",
			start: relDate(3, 8, 0),
			end: relDate(3, 8, 30),
			calendarId: "home",
		},
		{
			id: 8,
			text: "Grocery Run",
			start: relDate(4, 17, 0),
			end: relDate(4, 18, 0),
			calendarId: "home",
		},
	];

	const toolbar = { items: [
		{ id: "menu", comp: "menuButton" },
		{ comp: "spacer" },
		{ id: "title", comp: "dateLabel" },
		{ comp: "spacer" },
		{ id: "nav", comp: "dateNav" },
	]};

	let panelVisible = $state(true);
	const handleAction = (ev: { id: string }) => {
		if (ev.id === "menu-button") {
			panelVisible = !panelVisible;
		}
	};

	function cssByCalendar(obj: any) {
		return `cal-${obj.event.calendarId}`;
	}
</script>

<div class="layout">
	<Calendar events={data} view="week" {date} {toolbar} onaction={handleAction} eventCss={cssByCalendar}>
		<CalendarPanel open={panelVisible} {calendars} />
	</Calendar>
</div>

<style>
	.layout {
		height: 100%;
	}

	:global {
		.cal-work.wx-calendar-name {
			background-color: #9797f8;
			color: white;
		}
		.cal-work.wx-box-event, .cal-work.wx-bar-event {
			background-color: #9797f8;
		}

		.cal-home.wx-calendar-name {
			background-color: #a0e4c3;
			color: #444;
		}
		.cal-home.wx-box-event, .cal-home.wx-bar-event {
			background-color: #a0e4c3;
			color: #444;
		}

		.cal-holiday.wx-calendar-name {
			background-color: #f1e1b4;
		}
		.cal-holiday.wx-box-event, .cal-holiday.wx-bar-event {
			background-color: #f1e1b4;
			color: #444;
		}
	}
</style>
