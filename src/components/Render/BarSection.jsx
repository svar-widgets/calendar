import { setID } from '@svar-ui/lib-dom';
import './BarSection.css';

const scope = 'wx-aacgzzUM';
const laneHeight = 28;
const gap = 2;

function getStyle(p, dx, dy) {
  const left = dx * p.x + gap;
  const width = dx * p.width - gap * 2;
  const lane = p.lane ?? 0;
  const lanes = p.totalLanes ?? 1;
  const groupTop = dy * p.y;
  const groupHeight = dy * p.height;
  const rowLaneHeight = Math.min(laneHeight, groupHeight / lanes);
  const top = groupTop + lane * rowLaneHeight + gap;
  const height = rowLaneHeight - gap * 2;
  return { left, top, width, height };
}

function css(p, eventCss, view, section) {
  const base = p.event.css || '';
  const dynamic = eventCss
    ? eventCss({ event: p.event, view, section, mode: 'bars' })
    : '';
  return base + (dynamic ? ' ' + dynamic : '');
}

export default function BarSection({
  primitives,
  dx,
  dy,
  eventCss,
  eventContent: EventContentCmp,
  view,
  section,
}) {
  return (
    <div className={`wx-bar-section ${scope}`}>
      {primitives.map((p) => (
        <div
          key={p.id}
          className={`wx-bar-event ${css(p, eventCss, view, section)}${p.isMultiDay ? ' wx-bar-single-day' : ''} ${scope}`}
          style={getStyle(p, dx, dy)}
          data-id={setID(p.id)}
        >
          {EventContentCmp ? (
            <EventContentCmp event={p.event} mode="bars" />
          ) : (
            <span className={`wx-bar-title ${scope}`}>
              {p.event.text || '\u00a0'}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
