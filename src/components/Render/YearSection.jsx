import { useContext, useState, useMemo } from 'react';
import { context } from '@svar-ui/react-core';
import { Popup } from '@svar-ui/react-core';
import './YearSection.css';

const scope = 'wx-aaalPWdG';

export default function YearSection({
  section,
  tooltip: TooltipCmp,
  eventContent,
}) {
  const locale = useContext(context.i18n);
  const _ = locale.getGroup('eventCalendar');

  const columns = useMemo(
    () => section.ui?.columns ?? 3,
    [section.ui?.columns],
  );
  const weekStartDay = useMemo(
    () => section.ui?.weekStartDay ?? 1,
    [section.ui?.weekStartDay],
  );
  const months = useMemo(() => section.ui?.months ?? [], [section.ui?.months]);

  const weekdayBase = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekdays = useMemo(() => {
    const shift = ((weekStartDay % 7) + 7) % 7;
    const ordered = [];
    for (let i = 0; i < 7; i++) {
      const dow = (i + shift) % 7;
      ordered.push({
        label: weekdayBase[dow],
        weekend: dow === 0 || dow === 6,
      });
    }
    return ordered;
  }, [weekStartDay]);

  const [tooltipData, setTooltipData] = useState(null);

  function dateStr(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function getDays(month) {
    const days = [];
    for (let i = 0; i < month.startOffset; i++) {
      days.push({
        day: 0,
        empty: true,
        today: false,
        weekend: false,
        hasEvents: false,
        events: [],
      });
    }
    for (let d = 1; d <= month.totalDays; d++) {
      const events = month.markedDays[d] || [];
      const dow = new Date(month.year, month.month, d).getDay();
      days.push({
        day: d,
        empty: false,
        today: month.today === d,
        weekend: dow === 0 || dow === 6,
        hasEvents: events.length > 0,
        events,
      });
    }
    return days;
  }

  function showTooltip(e, events) {
    setTooltipData({
      element: e.currentTarget,
      events,
    });
  }

  function hideTooltip() {
    setTooltipData(null);
  }

  function formatTime(date) {
    return date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

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
    return `${formatTime(start)} \u2013 ${formatTime(end)}`;
  }

  function eventTitle(event) {
    return event.text || '';
  }

  const EventContentCmp = eventContent;

  return (
    <>
      <div
        className={`wx-year-grid ${scope}`}
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {months.map((month) => (
          <div key={month.month} className={`wx-year-month ${scope}`}>
            <div className={`wx-month-label ${scope}`}>{month.label}</div>
            <div className={`wx-month-grid ${scope}`}>
              {weekdays.map((wd, i) => (
                <div
                  key={i}
                  className={`wx-weekday-header${wd.weekend ? ' wx-weekend' : ''} ${scope}`}
                >
                  {wd.label}
                </div>
              ))}
              {getDays(month).map((day, idx) => {
                if (day.empty) {
                  return (
                    <div
                      key={idx}
                      className={`wx-month-day wx-empty ${scope}`}
                    ></div>
                  );
                }
                return (
                  <div
                    key={idx}
                    className={`wx-month-day${day.today ? ' wx-today' : ''}${day.weekend ? ' wx-weekend' : ''}${day.hasEvents ? ' wx-has-events' : ''} ${scope}`}
                    data-date={dateStr(month.year, month.month, day.day)}
                    aria-current={day.today ? 'date' : undefined}
                    onMouseEnter={
                      day.hasEvents
                        ? (e) => showTooltip(e, day.events)
                        : undefined
                    }
                    onMouseLeave={day.hasEvents ? hideTooltip : undefined}
                  >
                    <span className={`wx-day-num ${scope}`}>{day.day}</span>
                    {day.hasEvents && (
                      <span
                        className={`wx-event-dot ${scope}`}
                        aria-hidden="true"
                      ></span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {tooltipData && (
        <Popup
          parent={tooltipData.element}
          at="bottom-start"
          onCancel={hideTooltip}
        >
          <div
            className={`wx-year-tooltip${TooltipCmp ? ' wx-year-tooltip-custom' : ''} ${scope}`}
          >
            {TooltipCmp ? (
              <TooltipCmp events={tooltipData.events} />
            ) : (
              tooltipData.events.map((ev, i) => (
                <div key={ev.id ?? i} className={`wx-tooltip-event ${scope}`}>
                  {eventContent ? (
                    <div className={`wx-tooltip-event-content ${scope}`}>
                      <EventContentCmp event={ev} mode="year-tooltip" />
                    </div>
                  ) : (
                    <>
                      <span className={`wx-tooltip-time ${scope}`}>
                        {formatRange(ev)}
                      </span>
                      <span className={`wx-tooltip-title ${scope}`}>
                        {eventTitle(ev)}
                      </span>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </Popup>
      )}
    </>
  );
}
