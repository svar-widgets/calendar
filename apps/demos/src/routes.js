import SaveToBackend from "./cases/SaveToBackend.svelte";
import ICalImportExport from "./cases/ICalImportExport.svelte";
import BasicInit from "./cases/BasicInit.svelte";
import ContextMenu from "./cases/ContextMenu.svelte";
import Styling from "./cases/Styling.svelte";
import DayView from "./cases/DayView.svelte";
import WeekView from "./cases/WeekView.svelte";
import CombinedScale from "./cases/CombinedScale.svelte";
import MonthView from "./cases/MonthView.svelte";
import Filter from "./cases/Filter.svelte";
import CalendarPanel from "./cases/CalendarPanel.svelte";
import Toolbar from "./cases/Toolbar.svelte";
import Locales from "./cases/Locales.svelte";
import EditorComments from "./cases/Editor.svelte";
import Tooltip from "./cases/Tooltip.svelte";
import EventPopup from "./cases/EventPopup.svelte";
import EventContent from "./cases/EventContent.svelte";
import DragToCalendar from "./cases/DragToCalendar.svelte";
import Responsive from "./cases/Responsive.svelte";


export const links = [
	{
		group: "",
		items: [
			["/base/:skin", "Basic Calendar", BasicInit, { file: "BasicInit" }],
			[
				"/calendar-panel/:skin",
				"Calendar Panel",
				CalendarPanel,
				{ file: "CalendarPanel" },
			],
			["/responsive/:skin", "Mobile mode", Responsive, { file: "Responsive" }],
		],
	},
	{
		group: "Views",
		items: [
			["/day/:skin", "Day View", DayView, { file: "DayView" }],
			["/week/:skin", "Week View", WeekView, { file: "WeekView" }],
			["/month/:skin", "Month View", MonthView, { file: "MonthView" }],
		],
	},
	{
		group: "Features",
		items: [
			["/filter/:skin", "Filter Events", Filter, { file: "Filter" }],
			["/tooltip/:skin", "Event Tooltip", Tooltip, { file: "Tooltip" }],
			[
				"/event-card/:skin",
				"Event Preview",
				EventPopup,
				{ file: "EventPopup" },
			],
			[
				"/context-menu/:skin",
				"Context Menu",
				ContextMenu,
				{ file: "ContextMenu" },
			],
		],
	},
	{
		group: "Configuration",
		items: [
			["/toolbar/:skin", "Toolbar", Toolbar, { file: "Toolbar" }],
			[
				"/event-content/:skin",
				"Templates",
				EventContent,
				{ file: "EventContent" },
			],
			["/editor-comments/:skin", "Editor", EditorComments, { file: "Editor" }],
			["/styling/:skin", "Styling", Styling, { file: "Styling" }],
			["/locales/:skin", "Locales", Locales, { file: "Locales" }],
		],
	},
	{
		group: "Integration",
		items: [
			[
				"/backend/:skin",
				"Saving to Backend",
				SaveToBackend,
				{ file: "SaveToBackend" },
			],
			[
				"/drag-to-calendar/:skin",
				"Drag to Calendar",
				DragToCalendar,
				{ file: "DragToCalendar" },
			],
			[
				"/ical/:skin",
				"iCal Import/Export",
				ICalImportExport,
				{ file: "ICalImportExport" },
			],
		],
	},
];
