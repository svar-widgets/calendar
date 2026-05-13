import Widget from './components/Widget.jsx';
import CalendarPanel from './components/CalendarPanel.jsx';
import ContextMenu from './components/ContextMenu.jsx';
import Editor from './components/Editor.jsx';
import Willow from './themes/Willow.jsx';
import WillowDark from './themes/WillowDark.jsx';

import pkg from '../package.json' with { type: 'json' };

export const version = pkg.version;

export {
  getToolbarItems,
  getMenuOptions,
  registerCalendarView,
  WeekViewModel,
  DayViewModel,
  MonthViewModel,
} from '@svar-ui/calendar-store';

export { getEditorItems } from './components/editorItems.js';
export { registerEditorItem } from '@svar-ui/react-editor';
export { parseICal, serializeICal } from '@svar-ui/calendar-ical';
export { RestDataProvider } from '@svar-ui/calendar-provider';

export {
  Widget,
  Widget as Calendar,
  CalendarPanel,
  ContextMenu,
  Editor,
  Willow,
  WillowDark,
};
