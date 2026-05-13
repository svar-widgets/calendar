import { useState } from 'react';
import {
  Calendar,
  CalendarPanel,
  Editor,
  getEditorItems,
  registerEditorItem,
} from '../../src/';
import { RichSelect } from '@svar-ui/react-core';
import { relDate } from '../data.js';
import './CalendarPanel.css';

registerEditorItem('richselect', RichSelect);

const scopeCss = 'wx-aaeuHGVI';

const calendars = [
  { id: 'work', label: 'Work', css: 'cal-work' },
  { id: 'home', label: 'Home', css: 'cal-home' },
  {
    id: 'holiday',
    label: 'Holidays',
    css: 'cal-holiday',
    active: false,
  },
];

const date = relDate(0);

const data = [
  {
    id: 1,
    text: 'Team Standup',
    start: relDate(0, 9, 0),
    end: relDate(0, 9, 30),
    calendarId: 'work',
  },
  {
    id: 2,
    text: 'Sprint Review',
    start: relDate(0, 14, 0),
    end: relDate(0, 15, 0),
    calendarId: 'work',
  },
  {
    id: 3,
    text: 'Gym',
    start: relDate(0, 8, 0),
    end: relDate(0, 8, 30),
    calendarId: 'home',
  },
  {
    id: 4,
    text: 'Dentist',
    start: relDate(1, 10, 0),
    end: relDate(1, 11, 0),
    calendarId: 'home',
  },
  {
    id: 5,
    text: 'Music Festival',
    start: relDate(5),
    end: relDate(6),
    calendarId: 'holiday',
  },
  {
    id: 6,
    text: 'Design Sync',
    start: relDate(2, 11, 0),
    end: relDate(2, 12, 0),
    calendarId: 'work',
  },
  {
    id: 7,
    text: 'Gym',
    start: relDate(3, 8, 0),
    end: relDate(3, 8, 30),
    calendarId: 'home',
  },
  {
    id: 8,
    text: 'Grocery Run',
    start: relDate(4, 17, 0),
    end: relDate(4, 18, 0),
    calendarId: 'home',
  },
];

const toolbar = {
  items: [
    { id: 'menu', comp: 'menuButton' },
    { comp: 'spacer' },
    { id: 'title', comp: 'dateLabel' },
    { comp: 'spacer' },
    { id: 'nav', comp: 'dateNav' },
  ],
};

const editorItems = [
  ...getEditorItems(),
  {
    comp: 'richselect',
    key: 'calendarId',
    label: 'Calendar',
    options: calendars.map((c) => ({ id: c.id, label: c.label })),
  },
];

export default function CalendarPanelDemo() {
  function cssByCalendar(ctx) {
    return `cal-${ctx.event.calendarId}`;
  }

  const [panelVisible, setPanelVisible] = useState(true);
  const [activeCalendarIds, setActiveCalendarIds] = useState(
    calendars.filter((c) => c.active !== false).map((c) => c.id),
  );
  const [api, setApi] = useState(null);

  const handleAction = (ev) => {
    if (ev.id === 'menu-button') {
      setPanelVisible((v) => !v);
    }
  };

  const handleCalendarChange = (ev) => {
    if (ev.value.toString() !== activeCalendarIds.toString()) {
      setActiveCalendarIds(ev.value);
    }
  };

  const handleInit = (api) => {
    setApi(api);
    api.intercept('add-event', (action) => {
      if (!action.event.calendarId) {
        action.event.calendarId = activeCalendarIds[0] ?? calendars[0].id;
      }
    });
  };

  return (
    <div className={`layout ${scopeCss}`}>
      <Calendar
        events={data}
        view="week"
        date={date}
        toolbar={toolbar}
        onAction={handleAction}
        eventCss={cssByCalendar}
        init={handleInit}
      >
        <CalendarPanel
          open={panelVisible}
          calendars={calendars}
          onChange={handleCalendarChange}
        />
      </Calendar>
      {api && <Editor api={api} items={editorItems} />}
    </div>
  );
}
