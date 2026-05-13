import SaveToBackend from './cases/SaveToBackend.jsx';
import ICalImportExport from './cases/ICalImportExport.jsx';
import BasicInit from './cases/BasicInit.jsx';
import ContextMenu from './cases/ContextMenu.jsx';
import Styling from './cases/Styling.jsx';
import DayView from './cases/DayView.jsx';
import WeekView from './cases/WeekView.jsx';
import MonthView from './cases/MonthView.jsx';
import Filter from './cases/Filter.jsx';
import CalendarPanel from './cases/CalendarPanel.jsx';
import Toolbar from './cases/Toolbar.jsx';
import Locales from './cases/Locales.jsx';
import EditorComments from './cases/Editor.jsx';
import Tooltip from './cases/Tooltip.jsx';
import EventPopup from './cases/EventPopup.jsx';
import EventContent from './cases/EventContent.jsx';


export const links = [
  {
    group: '',
    items: [
      ['/base/:skin', 'Basic Calendar', BasicInit, { file: 'BasicInit' }],
      [
        '/calendar-panel/:skin',
        'Calendar Panel',
        CalendarPanel,
        { file: 'CalendarPanel' },
      ],
    ],
  },
  {
    group: 'Views',
    items: [
      ['/day/:skin', 'Day View', DayView, { file: 'DayView' }],
      ['/week/:skin', 'Week View', WeekView, { file: 'WeekView' }],
      ['/month/:skin', 'Month View', MonthView, { file: 'MonthView' }],
    ],
  },
  {
    group: 'Features',
    items: [
      ['/filter/:skin', 'Filter Events', Filter, { file: 'Filter' }],
      ['/tooltip/:skin', 'Event Tooltip', Tooltip, { file: 'Tooltip' }],
      [
        '/event-card/:skin',
        'Event Preview',
        EventPopup,
        { file: 'EventPopup' },
      ],
      [
        '/context-menu/:skin',
        'Context Menu',
        ContextMenu,
        { file: 'ContextMenu' },
      ],
    ],
  },
  {
    group: 'Configuration',
    items: [
      ['/toolbar/:skin', 'Toolbar', Toolbar, { file: 'Toolbar' }],
      [
        '/event-content/:skin',
        'Templates',
        EventContent,
        { file: 'EventContent' },
      ],
      ['/editor-comments/:skin', 'Editor', EditorComments, { file: 'Editor' }],
      ['/styling/:skin', 'Styling', Styling, { file: 'Styling' }],
      ['/locales/:skin', 'Locales', Locales, { file: 'Locales' }],
    ],
  },
  {
    group: 'Integration',
    items: [
      [
        '/backend/:skin',
        'Saving to Backend',
        SaveToBackend,
        { file: 'SaveToBackend' },
      ],
      [
        '/ical/:skin',
        'iCal Import/Export',
        ICalImportExport,
        { file: 'ICalImportExport' },
      ],
    ],
  },
];
