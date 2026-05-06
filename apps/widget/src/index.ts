import Calendar from "./components/Calendar.svelte";
import CalendarPanel from "./components/CalendarPanel.svelte";
import ContextMenu from "./components/ContextMenu.svelte";
import Editor from "./components/Editor.svelte";

import Willow from "./themes/Willow.svelte";
import WillowDark from "./themes/WillowDark.svelte";

export {
	getToolbarItems,
	getMenuOptions,
	registerCalendarView,
	WeekViewModel,
	DayViewModel,
	MonthViewModel,
} from "@svar-ui/calendar-store";

export type {
	ToolbarItem,
	CalendarEvent,
	CellContext,
	EventContext,
	EventContentMode,
	CellCss,
	EventCss,
} from "@svar-ui/calendar-store";
export type {
	CalendarContextApi,
	CalendarInstanceApi,
	ViewOption,
} from "./components/types.js";
export { getEditorItems } from "./components/editorItems.js";
export { registerEditorItem } from "@svar-ui/svelte-editor";
export { parseICal, serializeICal } from "@svar-ui/calendar-ical";
export { RestDataProvider } from "@svar-ui/calendar-provider";
export { Calendar, CalendarPanel, ContextMenu, Editor, Willow, WillowDark };
