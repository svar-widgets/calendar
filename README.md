<div align="center">

# SVAR React Calendar

[Website](https://svar.dev/react/calendar/) • [Docs](https://docs.svar.dev/react/calendar/getting-started/quick-start/) • [Demos](https://docs.svar.dev/react/calendar/samples/)

[![npm](https://img.shields.io/npm/v/@svar-ui/react-calendar.svg)](https://www.npmjs.com/package/@svar-ui/react-calendar)
[![License](https://img.shields.io/github/license/svar-widgets/react-calendar)](https://github.com/svar-widgets/react-calendar/blob/main/license.txt)
[![npm downloads](https://img.shields.io/npm/dm/@svar-ui/react-calendar.svg)](https://www.npmjs.com/package/@svar-ui/react-calendar)

</div>

[SVAR React Calendar](https://svar.dev/react/calendar/) is a customizable, high-performance React calendar component for event planning and scheduling. It includes multiple built-in calendar views, event edit form, filtering, theming, drag-and-drop interactions, and a flexible API for toolbars and menus.

The component helps you quickly build modern scheduling interfaces for React applications with minimal setup. Includes TypeScript support and is compatible with React 18+ and Next.js.

<div align="center">
<img src="https://svar.dev/images/github/github-calendar.gif" alt="SVAR React Calendar Preview">
</div>

### ✨ Key Features

- Day, week, and month views
- Drag-and-drop event move and resize
- Drag-to-create events in time-grid views
- Sidebar or popup event editor
- Calendar groups sidebar with built-in filtering
- Context menu support for quick actions
- Custom toolbar layouts and helper APIs
- Custom event content, event cards, and tooltips
- Event filtering with tagged predicates
- Localization and configurable week start
- Built-in light and dark themes
- iCal import/export support
- Custom view registration for advanced layouts
- TypeScript definitions included
- React 18+ compatible

### 🚀 PRO Edition

SVAR React Calendar is available in open-source and PRO editions. The PRO build adds advanced scheduling views and recurrence support without changing the component API.

PRO features include:

- Agenda view
- Year view
- Resources view
- Timeline view
- Recurring events with RRULE expansion

Visit the [pricing page](https://svar.dev/react/calendar/pricing/) for licensing details, feature comparison, and free trial.

[Check out the live demo](https://svar.dev/demos/react/calendar/) to see SVAR React Calendar in action.

### :hammer_and_wrench: How to Use

Import the package, pass an `events` array and a `date`, and optionally attach the editor through the calendar API:

```jsx
import { useState } from 'react';
import { Calendar, Editor } from '@svar-ui/react-calendar';
import '@svar-ui/react-calendar/all.css';

const events = [
  {
    id: 1,
    text: 'Team standup',
    start: new Date(2026, 3, 20, 9, 0),
    end: new Date(2026, 3, 20, 9, 30),
  },
  {
    id: 2,
    text: 'Sprint planning',
    start: new Date(2026, 3, 20, 10, 0),
    end: new Date(2026, 3, 20, 11, 30),
  },
];

export default function App() {
  const [api, setApi] = useState(null);

  return (
    <>
      <Calendar init={setApi} events={events} date={new Date(2026, 3, 20)} />
      {api && <Editor api={api} />}
    </>
  );
}
```

By default, the calendar exposes `day`, `week`, and `month` views. Add extra view ids through the `views` prop to enable `agenda`, `year`, `resources`, or `timeline`.

For further instructions, follow the detailed [quick start guide](https://docs.svar.dev/react/calendar/getting-started/quick-start/).

### :speech_balloon: Need Help?

[Post an issue](https://github.com/svar-widgets/react-calendar/issues) or use our [community forum](https://forum.svar.dev).

### ⭐ Show Your Support

If SVAR React Calendar helps your project, [give it a star](https://github.com/svar-widgets/react-calendar). It helps other developers discover this library and motivates us to keep improving.
