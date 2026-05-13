import { useContext, useMemo } from 'react';
import { context } from '@svar-ui/react-core';
import { setID } from '@svar-ui/lib-dom';
import store from '../../context.js';
import './ListSection.css';

const scope = 'wx-aabV8sAP';

export default function ListSection({ primitives, eventContent }) {
  const api = useContext(store);
  const locale = useContext(context.i18n);
  const _ = locale.getGroup('eventCalendar');
  const fmtDate = api.fmt('agendaDayFormat');
  const fmtTime = api.fmt('timeScaleFormat');

  function formatRange(event) {
    const { start, end } = event;
    if (
      event.allDay ||
      start.getFullYear() !== end.getFullYear() ||
      start.getMonth() !== end.getMonth() ||
      start.getDate() !== end.getDate()
    ) {
      return _('Full day');
    }
    return `${fmtTime(start)} \u2013 ${fmtTime(end)}`;
  }

  const groups = useMemo(() => {
    const map = new Map();
    for (const p of primitives) {
      const d = p.event.start;
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      let group = map.get(key);
      if (!group) {
        const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        group = { date, label: fmtDate(date), events: [] };
        map.set(key, group);
      }
      group.events.push(p);
    }
    return Array.from(map.values());
  }, [primitives, fmtDate]);

  const EventContentCmp = eventContent;

  return (
    <div className={`wx-list-section ${scope}`}>
      {groups.map((group) => (
        <div key={group.date.getTime()} className={`wx-list-day ${scope}`}>
          <div className={`wx-list-date ${scope}`}>{group.label}</div>
          <div className={`wx-list-events ${scope}`}>
            {group.events.map((p) => (
              <div
                key={p.id}
                className={`wx-list-event ${scope}`}
                data-id={setID(p.id)}
              >
                {eventContent ? (
                  <div className={`wx-list-event-content ${scope}`}>
                    <EventContentCmp event={p.event} mode="list" />
                  </div>
                ) : (
                  <>
                    <span className={`wx-event-time ${scope}`}>
                      {formatRange(p.event)}
                    </span>
                    <span className={`wx-event-title ${scope}`}>
                      {p.event.text || ''}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      {groups.length === 0 && (
        <div className={`wx-list-empty ${scope}`} role="status">
          No events this month
        </div>
      )}
    </div>
  );
}
