import {
  useContext,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import { useStore } from '@svar-ui/lib-react';
import { Popup } from '@svar-ui/react-core';
import store from '../../context.js';
import { drag } from '../../directives/drag.js';
import { clickevent } from '../../directives/clickevent.js';
import { clickdate } from '../../directives/clickdate.js';
import Headers from './Headers.jsx';
import SectionContent from './SectionContent.jsx';
import { useEventOverlay } from './useEventOverlay.jsx';
import './ScrollableSection.css';

const scope = 'wx-aacAsb1k';

export default function ScrollableSection({
  data,
  cellCss,
  eventCss,
  eventContent,
  view,
  tooltip,
  eventPopup,
  readonly = false,
}) {
  const api = useContext(store);
  const viewValue = useStore(api, '_view');

  const section = useMemo(() => data[0], [data]);
  const xHeaders = useMemo(() => section?.xHeaders ?? null, [section]);
  const yHeaders = useMemo(() => section?.yHeaders ?? null, [section]);
  const showXHeaders = useMemo(
    () => xHeaders !== null && section?.xVisible !== false,
    [xHeaders, section],
  );
  const showYHeaders = useMemo(
    () => yHeaders !== null && section?.yVisible !== false,
    [yHeaders, section],
  );

  const contentRef = useRef(null);
  const [contentWidth, setContentWidth] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [ready, setReady] = useState(false);

  const measure = useCallback(() => {
    const el = contentRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const w = Math.round(rect.width * 1000) / 1000;
      const h = Math.round(rect.height * 1000) / 1000;
      setContentWidth((prev) => (prev !== w ? w : prev));
      setContentHeight((prev) => (prev !== h ? h : prev));
    }
  }, []);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    measure();
    setReady(true);
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  const dx = useMemo(() => contentWidth / 100, [contentWidth]);
  const dy = useMemo(() => contentHeight / 100, [contentHeight]);

  const minW = useMemo(() => {
    if (!xHeaders) return 0;
    const inner = xHeaders[xHeaders.length - 1];
    if (!inner?.length) return 0;
    const v = inner[0].ui?.minUnitWidth;
    return typeof v === 'number' ? inner.length * v : 0;
  }, [xHeaders]);

  const minH = useMemo(() => {
    if (!yHeaders) return 0;
    const inner = yHeaders[yHeaders.length - 1];
    if (!inner?.length) return 0;
    const v = inner[0].ui?.minUnitHeight;
    return typeof v === 'number' ? inner.length * v : 0;
  }, [yHeaders]);

  const overlay = useEventOverlay(
    useCallback((id) => api.getEvent(id), [api]),
    useCallback(
      () => (section?.mode === 'boxes' ? 'right-start' : 'bottom-start'),
      [section],
    ),
  );

  // Directives via useEffect + useRef
  const directivesRef = useRef(null);

  const dragOpts = useMemo(
    () => ({
      mode: section?.mode ?? 'boxes',
      dx,
      dy,
      xHeaders,
      yHeaders,
      sectionName: section?.name ?? '',
      model: viewValue,
      exec: api.exec,
      getEvent: (id) => api.getEvent(id),
      move: !readonly && !!section?.ui?.drag,
      clipDrag: section?.ui?.clipDrag !== false,
      create: !readonly && !!section?.ui?.dragCreate,
    }),
    [section, dx, dy, xHeaders, yHeaders, viewValue, api, readonly],
  );

  const clickeventOpts = useMemo(
    () => ({
      exec: api.exec,
      getEvent: (id) => api.getEvent(id),
      onEventPopup: eventPopup ? overlay.handleEventPopup : undefined,
    }),
    [api, eventPopup, overlay.handleEventPopup],
  );

  const clickdateOpts = useMemo(() => ({ exec: api.exec }), [api.exec]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const d = drag(el, dragOpts);
    const ce = clickevent(el, clickeventOpts);
    const cd = clickdate(el, clickdateOpts);
    directivesRef.current = { d, ce, cd };
    return () => {
      d.destroy();
      ce.destroy();
      cd.destroy();
    };
  }, []);

  // Update directives when options change
  useEffect(() => {
    if (directivesRef.current) {
      directivesRef.current.d.update(dragOpts);
    }
  }, [dragOpts]);

  useEffect(() => {
    if (directivesRef.current) {
      directivesRef.current.ce.update(clickeventOpts);
    }
  }, [clickeventOpts]);

  useEffect(() => {
    if (directivesRef.current) {
      directivesRef.current.cd.update(clickdateOpts);
    }
  }, [clickdateOpts]);

  const popupExtra = useMemo(() => ({ trackScroll: true }), []);

  const scrollGridCn = [
    'wx-scroll-grid',
    scope,
    showXHeaders ? 'wx-has-x-headers' : '',
    showYHeaders ? 'wx-has-y-headers' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const TooltipCmp = tooltip;
  const EventPopupCmp = eventPopup;

  return (
    <div className={`wx-scrollable-section ${scope}`}>
      <div className={scrollGridCn}>
        {showXHeaders && showYHeaders && (
          <div className={`wx-corner ${scope}`}></div>
        )}
        {showXHeaders && (
          <div className={`wx-x-headers-sticky ${scope}`}>
            <Headers headers={xHeaders} direction="x" />
          </div>
        )}
        {showYHeaders && (
          <div className={`wx-y-headers-sticky ${scope}`}>
            <Headers headers={yHeaders} direction="y" />
          </div>
        )}
        <div
          className={`wx-content ${scope}`}
          style={{
            minWidth: minW > 0 ? `${minW}px` : undefined,
            minHeight: minH > 0 ? `${minH}px` : undefined,
          }}
          ref={contentRef}
          onMouseMove={tooltip ? overlay.handleTooltipMove : undefined}
          onMouseLeave={tooltip ? overlay.handleTooltipLeave : undefined}
        >
          {section?.ui?.dragCreate && (
            <div
              className={`wx-drag-stub ${scope}`}
              data-drag-stub=""
              aria-hidden="true"
            ></div>
          )}
          {section && (
            <SectionContent
              section={section}
              dx={dx}
              dy={dy}
              scrollHeight={null}
              measured={ready && contentWidth > 0 && contentHeight > 0}
              cellCss={cellCss}
              eventCss={eventCss}
              eventContent={eventContent}
              view={view}
              tooltip={tooltip}
            />
          )}
        </div>
      </div>

      {overlay.tooltipState && TooltipCmp && (
        <div
          className={`wx-calendar-tooltip ${scope}`}
          style={{
            position: 'fixed',
            left: `${overlay.mousePos.x + 12}px`,
            top: `${overlay.mousePos.y + 16}px`,
            zIndex: 10000,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <TooltipCmp event={overlay.tooltipState.event} />
        </div>
      )}

      {overlay.eventPopupState && EventPopupCmp && (
        <Popup
          at={overlay.eventPopupState.at}
          parent={overlay.eventPopupState.element}
          onCancel={overlay.hideEventPopup}
          {...popupExtra}
        >
          <EventPopupCmp
            event={overlay.eventPopupState.event}
            close={overlay.hideEventPopup}
          />
        </Popup>
      )}
    </div>
  );
}
