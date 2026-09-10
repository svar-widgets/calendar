<div align="center">
	
# SVAR Svelte Calendar

</div>

<div align="center">

[Homepage](https://svar.dev/svelte/calendar/) • [Getting Started](https://docs.svar.dev/svelte/calendar/getting-started/quick-start/) • [Demos](https://docs.svar.dev/svelte/calendar/samples/)

</div>

<div align="center">

[![npm](https://img.shields.io/npm/v/@svar-ui/svelte-calendar.svg)](https://www.npmjs.com/package/@svar-ui/svelte-calendar)
[![License](https://img.shields.io/github/license/svar-widgets/calendar)](https://github.com/svar-widgets/calendar/blob/main/license.txt)
[![npm downloads](https://img.shields.io/npm/dm/@svar-ui/svelte-calendar.svg)](https://www.npmjs.com/package/@svar-ui/svelte-calendar)

</div>

[SVAR Svelte Calendar](https://svar.dev/svelte/calendar/) is an interactive event calendar and scheduler component for Svelte and SvelteKit apps. It supports Day, Week, and Month views, drag-and-drop event editing, a ready-to-use event edit form, and rich customization options.

The calendar comes with full TypeScript support, extensible API, and flexible CSS styling. The PRO Edition offers additional views (Year, Agenda, Timeline, Resources) and recurring event support.

<div align="center">
<img src="https://svar.dev/images/github/github-calendar.gif" alt="SVAR Svelte Calendar Preview">
</div>

### ✨ Key Features

- Multiple built-in views: Day, Week, Month
- Drag-and-drop to move, resize, and create events
- Customizable event editor form
- Context menu and toolbar
- Tooltips and custom event cards
- Custom HTML in event markup
- Multiple calendars with toggleable visibility
- Event filtering
- iCal import/export
- Localization
- Light and dark themes
- Full TypeScript support
- REST data provider for backend integration

### 🚀 PRO Edition

SVAR Svelte Calendar is available in open-source and [PRO Editions](https://svar.dev/svelte/calendar/#pro). The PRO Edition offers four more scheduling views and automation features:

- Year view
- Agenda view
- Timeline view (horizontal timeline with resource rows)
- Resources view (single day with resource columns)
- Recurring events (RRULE-based)

Visit the [pricing page](https://svar.dev/svelte/calendar/pricing/) for full feature comparison, licensing details, and **free trial**.

Or [see the live demo](https://svar.dev/demos/calendar/).

### 🛠️ How to Use

To use the calendar widget, simply import the package and include the component in your Svelte file:

```svelte
<script>
	import { Calendar } from "@svar-ui/svelte-calendar";

	const events = [
		{
			id: 1,
			start: new Date(2026, 4, 5, 10, 0),
			end: new Date(2026, 4, 5, 11, 30),
			text: "Project kickoff",
			details: "Outline the project's scope and resources.",
		},
	];
	const date = new Date(2026, 4, 5);
</script>

<Calendar {events} {date} view="week" />
```

For further instructions, follow the detailed [quick start guide](https://docs.svar.dev/svelte/calendar/getting-started/quick-start/).

### How to Modify

Typically, you don't need to modify the code. However, if you wish to do so, follow these steps:

1. Install [vite-plus](https://vite.plus) (`curl -fsSL https://vite.plus | bash` on Mac/Linux, `irm https://vite.plus/ps1 | iex` on Windows). The project uses `pnpm` workspaces under the hood, so plain `npm` will not work.
2. Run `vp i` from the project root to install dependencies.
3. Run `vp run build` to build all packages.
4. Start the demo app in development mode with `vp run start`.

### Run Tests

To run the tests:

```sh
vp test
```

### ⭐ Show Your Support

If SVAR Svelte Calendar helps your project, [give us a star](https://github.com/svar-widgets/calendar/)! It helps us reach more developers and keeps us motivated to add new features.

### :speech_balloon: Need Help?

[Post an Issue](https://github.com/svar-widgets/calendar/issues/) or use our [community forum](https://forum.svar.dev).
