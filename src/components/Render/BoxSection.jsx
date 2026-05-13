import { setID } from '@svar-ui/lib-dom';
import './BoxSection.css';

const gap = 2;
const overlap = 20;

function getStyle(p, dx, dy, layoutMode) {
  const top = dy * p.y;
  const height = dy * p.height - 1;
  if (layoutMode === 'overlap') {
    const slot = p.slot ?? 0;
    const laneOffset = slot * overlap;
    const left = dx * p.x + gap + laneOffset;
    const width = Math.max(0, dx * p.width - gap * 2 - laneOffset);
    return { left, top, width, height, zIndex: slot };
  }
  const slotWidth = p.width / (p.maxConcurrency ?? 1);
  const left = dx * (p.x + (p.slot ?? 0) * slotWidth) + gap;
  const width = dx * slotWidth - gap * 2;
  return { left, top, width, height };
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function css(p, eventCss, view, section) {
  const base = p.event.css || '';
  const dynamic = eventCss
    ? eventCss({ event: p.event, view, section, mode: 'boxes' })
    : '';
  return base + (dynamic ? ' ' + dynamic : '');
}

const scope = 'wx-aaeAihGE';

export default function BoxSection({
  primitives,
  dx,
  dy,
  layoutMode = 'split',
  eventCss,
  eventContent: EventContentCmp,
  view,
  section,
}) {
  return (
    <div className={`wx-box-section ${scope}`}>
      {primitives.map((p) => (
        <div
          key={p.id}
          className={`wx-box-event ${css(p, eventCss, view, section)} ${scope}`}
          style={getStyle(p, dx, dy, layoutMode)}
          data-id={setID(p.id)}
        >
          {EventContentCmp ? (
            <EventContentCmp event={p.event} mode="boxes" />
          ) : (
            <>
              <div className={`wx-box-time ${scope}`}>
                {formatTime(p.event.start)} – {formatTime(p.event.end)}
              </div>
              <div className={`wx-box-title ${scope}`}>
                {p.event.text || ''}
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
