import { useState, useRef, useCallback } from 'react';
import { getID, locate } from '@svar-ui/lib-dom';

export function useEventOverlay(getEvent, getEventPopupAt) {
  const tooltipTargetRef = useRef(null);
  const [tooltipState, setTooltipState] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [eventPopupState, setEventPopupState] = useState(null);

  const handleTooltipMove = useCallback(
    (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (eventPopupState || !e.target) return;
      const el = locate(e.target) ?? null;
      if (el === tooltipTargetRef.current) return;
      tooltipTargetRef.current = el;
      if (!el) {
        setTooltipState(null);
        return;
      }
      const ev = getEvent(getID(el));
      setTooltipState(ev ? { event: ev } : null);
    },
    [getEvent, eventPopupState],
  );

  const handleTooltipLeave = useCallback(() => {
    tooltipTargetRef.current = null;
    setTooltipState(null);
  }, []);

  const handleEventPopup = useCallback(
    (info) => {
      setTooltipState(null);
      tooltipTargetRef.current = null;
      if (!info) {
        setEventPopupState(null);
        return;
      }
      const ev = getEvent(info.eventId);
      if (ev) {
        setEventPopupState({
          event: ev,
          element: info.element,
          at: getEventPopupAt(info.element),
        });
      }
    },
    [getEvent, getEventPopupAt],
  );

  const hideEventPopup = useCallback(() => {
    setEventPopupState(null);
  }, []);

  return {
    tooltipState,
    mousePos,
    eventPopupState,
    handleTooltipMove,
    handleTooltipLeave,
    handleEventPopup,
    hideEventPopup,
  };
}
