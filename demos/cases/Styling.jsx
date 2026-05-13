import { useState } from 'react';
import {
  Calendar,
  Editor,
  getEditorItems,
  registerEditorItem,
} from '../../src/';
import { RichSelect } from '@svar-ui/react-core';
import { relDate } from '../data.js';
import './Styling.css';

const date = relDate(0);

const events = [
  {
    id: 1,
    text: 'Team offsite',
    start: relDate(0),
    end: relDate(3),
    priority: 'low',
  },
  {
    id: 2,
    text: 'Design review',
    start: relDate(-1, 10, 0),
    end: relDate(-1, 11, 30),
    priority: 'medium',
  },
  {
    id: 3,
    text: 'Standup',
    start: relDate(3, 9, 0),
    end: relDate(3, 9, 30),
    priority: 'low',
  },
  {
    id: 4,
    text: 'Sprint planning',
    start: relDate(3, 14, 0),
    end: relDate(3, 15, 30),
    priority: 'high',
  },
  {
    id: 5,
    text: 'Lunch break',
    start: relDate(0, 12, 0),
    end: relDate(0, 13, 0),
    priority: 'low',
  },
];

registerEditorItem('richselect', RichSelect);

const editorItems = [
  ...getEditorItems(),
  {
    comp: 'richselect',
    key: 'priority',
    label: 'Priority',
    options: [
      { id: 'high', label: 'High' },
      { id: 'medium', label: 'Medium' },
      { id: 'low', label: 'Low' },
    ],
  },
];

function cellCss(ctx) {
  const { date, section } = ctx;
  if (!date) return '';
  const day = date.getDay();
  if (day === 0 || day === 6) return 'weekend';
  if (section === 'timeGrid' && date.getHours() >= 12 && date.getHours() < 13)
    return 'lunch';
  if (day === 5) return 'holiday';
  return '';
}

function eventCss(ctx) {
  const { event, mode } = ctx;
  const cls = `priority-${event.priority || 'default'}`;
  if (mode === 'grid') return cls + ' grid-event';
  if (mode === 'bars') return cls + ' bar-event';
  if (mode === 'boxes') return cls + ' box-event';
  return cls;
}

export default function Styling() {
  const [api, setApi] = useState(null);

  return (
    <>
      <Calendar
        init={setApi}
        events={events}
        views={['day', 'week', 'month']}
        view="week"
        date={date}
        cellCss={cellCss}
        eventCss={eventCss}
      />
      {api && <Editor api={api} items={editorItems} />}
    </>
  );
}
