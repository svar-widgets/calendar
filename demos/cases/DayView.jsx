import { useState, useMemo } from 'react';
import { Calendar, Editor } from '../../src/';
import { Segmented } from '@svar-ui/react-core';
import { Layout } from '@svar-ui/react-layout';

function at(hour, minute = 0) {
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

const events = [
  { id: 1, text: 'Standup', start: at(9, 0), end: at(10, 15) },
  { id: 2, text: 'Design review', start: at(11, 0), end: at(12, 30) },
  { id: 3, text: 'Sprint planning', start: at(14, 0), end: at(15, 30) },
];

const modes = [
  { id: 'full', label: 'Full day' },
  { id: 'work', label: 'Working hours' },
];

export default function DayView() {
  const [api, setApi] = useState(null);
  const [mode, setMode] = useState('work');

  const views = useMemo(
    () => [
      {
        id: 'day',
        sections: {
          timeGrid: {
            yScale: {
              startHour: mode === 'work' ? 8 : 0,
              endHour: mode === 'work' ? 18 : 24,
              step: mode === 'work' ? 60 : 120,
              ui: { minUnitHeight: 40 },
            },
            ui: { nowLine: true },
          },
        },
      },
    ],
    [mode],
  );

  return (
    <>
      <Layout preset="space">
        <Segmented
          options={modes}
          value={mode}
          onChange={(v) => setMode(v.value)}
        />
        <Calendar
          init={setApi}
          events={events}
          view="day"
          date={new Date()}
          views={views}
        />
      </Layout>
      {api && <Editor api={api} />}
    </>
  );
}
