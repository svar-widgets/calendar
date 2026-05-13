import { useState, useMemo } from 'react';
import { getData } from '../data';
import { Calendar, Editor } from '../../src/';
import { Checkbox, Locale } from '@svar-ui/react-core';
import { Layout } from '@svar-ui/react-layout';

export default function MonthView() {
  const { data, date } = getData();
  const [wNumbers, setWNumbers] = useState(false);
  const [sundayStart, setSundayStart] = useState(false);
  const [api, setApi] = useState(null);

  const weekStart = useMemo(() => (sundayStart ? 0 : 1), [sundayStart]);
  const words = useMemo(() => ({ calendar: { weekStart } }), [weekStart]);

  const views = useMemo(
    () => [
      {
        id: 'month',
        sections: {
          month: {
            yScale: {
              visible: wNumbers,
              format: wNumbers ? 'weekNumberFormat' : undefined,
            },
          },
        },
      },
    ],
    [wNumbers],
  );

  return (
    <>
      <Layout preset="space">
        <Checkbox
          label="Week numbers"
          value={wNumbers}
          onChange={({ value }) => setWNumbers(value)}
        />
        <Checkbox
          label="Start week on Sunday"
          value={sundayStart}
          onChange={({ value }) => setSundayStart(value)}
        />
        <Locale key={weekStart} words={words}>
          <Calendar
            init={setApi}
            events={data}
            view="month"
            date={date}
            views={views}
          />
        </Locale>
      </Layout>
      {api && <Editor api={api} />}
    </>
  );
}
