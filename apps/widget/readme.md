<div align="center">
	
# SVAR Svelte Event Calendar

</div>

<div align="center">

[Website](https://svar.dev/svelte/calendar/) • [Getting Started](https://docs.svar.dev/svelte/calendar/getting_started/) • [Demos](https://docs.svar.dev/svelte/calendar/samples/#/base/willow)

</div>

<div align="center">

[![npm](https://img.shields.io/npm/v/@svar-ui/svelte-calendar.svg)](https://www.npmjs.com/package/@svar-ui/svelte-calendar)
[![License](https://img.shields.io/github/license/svar-widgets/calendar)](https://github.com/svar-widgets/calendar/blob/main/license.txt)
[![npm downloads](https://img.shields.io/npm/dm/@svar-ui/svelte-calendar.svg)](https://www.npmjs.com/package/@svar-ui/svelte-calendar)

</div>

**SVAR Svelte Event Calendar** is a customizable, interactive event calendar component written in Svelte and designed for scheduling and managing events. The component provides multiple views (day, week, month) with drag-and-drop event editing, a built-in event editor, and rich customization options. Comes with full TypeScript support, developer-friendly API, and flexible CSS styling.

<div align="center">
<img src="https://svar.dev/images/github/basic-calendar-svelte.gif" alt="SVAR Svelte Calendar UI">
</div>

### Key Features

- Multiple built-in views: Day, Week, Month
- Drag-and-drop to move, resize, and create events
- Customizable event editor form
- Context menu and toolbar
- Tooltips and custom event cards
- Calendar groups for grouping events by category
- Event filtering
- iCal import/export
- REST data provider for backend integration
- Custom HTML in event markup
- Localization
- Light and dark skins
- Full TypeScript support

### 🚀 PRO Edition

SVAR Svelte Calendar is available in open-source and [PRO Editions](https://svar.dev/svelte/calendar/#pro). The PRO Edition offers additional views and automation features:

- Year view
- Agenda view
- Timeline view (horizontal timeline with resource rows)
- Resources view (single day with resource columns)
- Recurring events (RRULE-based)

Visit the [pricing page](https://svar.dev/svelte/calendar/pricing/) for full feature comparison, licensing details, and **free trial**.

Or [see the live demo](https://svar.dev/demos/calendar/).

### 🛠️ How to Use

To use the widget, simply import the package and include the component in your Svelte file:

```svelte
<script>
	import { Calendar } from "@svar/svelte-calendar";

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

For further instructions, follow the detailed [how-to-start guide](https://docs.svar.dev/svelte/calendar/getting-started/quick-start/).

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

If SVAR Svelte Calendar helps your project, give us a star! It helps us reach more developers and keeps us motivated to add new features.

### :speech_balloon: Need Help?

[Post an Issue](https://github.com/svar-widgets/calendar/issues/) or use our [community forum](https://forum.svar.dev).
