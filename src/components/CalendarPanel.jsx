import { useContext, useMemo, useEffect, useCallback } from 'react';
import { useStore } from '@svar-ui/lib-react';
import { Calendar, Checkbox } from '@svar-ui/react-core';
import { context } from '@svar-ui/react-core';
import store from '../context.js';
import './CalendarPanel.css';

const scope = 'wx-aadBCnsx';

export default function CalendarPanel({
  calendars,
  accessor = 'calendarId',
  open = true,
  onChange,
}) {
  const calendarApi = useContext(store);
  const locale = useContext(context.i18n);
  const _ = locale?.getGroup('eventCalendar');

  const currentDateValue = useStore(calendarApi, 'currentDate');
  const visibleDateRangeValue = useStore(calendarApi, 'visibleDateRange');

  const active = useMemo(() => {
    return calendars.reduce((acc, cal) => {
      acc[cal.id] = cal.active !== false;
      return acc;
    }, {});
  }, [calendars]);

  const rangeMarkers = useMemo(() => {
    const range = visibleDateRangeValue;
    const startTime = range.start.getTime();
    const endTime = range.end.getTime();
    return (date) => {
      const t = date.getTime();
      return t >= startTime && t < endTime ? 'wx-view-range' : '';
    };
  }, [visibleDateRangeValue]);

  const applyFilter = useCallback(() => {
    const value = [];
    for (const a in active) {
      if (active[a]) value.push(a);
    }

    const filter =
      value.length === calendars.length
        ? null
        : (event) => active[event[accessor]];

    if (calendarApi) {
      calendarApi.exec('filter-events', {
        filter,
        tag: 'calendar-panel',
      });
    }
    onChange?.({ value, filter });
  }, [active, calendars, accessor, calendarApi, onChange]);

  function toggle(id) {
    active[id] = !active[id];
    applyFilter();
  }

  useEffect(() => {
    if (calendars.some((c) => c.active === false)) applyFilter();
  }, [calendars, applyFilter]);

  function onDateChange({ value }) {
    if (value && calendarApi) {
      calendarApi.exec('navigate-to', { date: value });
    }
  }

  return open ? (
    <div className={`wx-calendar-panel ${scope}`}>
      <div className={scope} role="group" aria-label={_?.('Calendar filters')}>
        {calendars.map((cal) => (
          <div
            key={cal.id}
            className={`wx-calendar-name ${cal.css || ''} ${scope}`}
          >
            <Checkbox
              value={active[cal.id] ?? true}
              onChange={() => toggle(cal.id)}
              label={cal.label}
            />
          </div>
        ))}
      </div>

      <div className={`wx-calendar-panel-bottom ${scope}`}>
        <Calendar
          buttons={false}
          value={currentDateValue}
          onChange={({ value }) => onDateChange({ value })}
          markers={rangeMarkers}
        />
      </div>
    </div>
  ) : null;
}
