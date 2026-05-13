import { getID, locate } from '@svar-ui/lib-dom';

const CLICK_THRESHOLD = 3;

export function clickevent(node, options) {
  let opts = options;
  let startX = 0;
  let startY = 0;
  let target = null;

  function handleMouseDown(e) {
    if (e.button !== 0) return;
    startX = e.clientX;
    startY = e.clientY;
    target = e.target;
  }

  function handleMouseUp(e) {
    if (!target) return;

    const dx = Math.abs(e.clientX - startX);
    const dy = Math.abs(e.clientY - startY);
    if (dx > CLICK_THRESHOLD || dy > CLICK_THRESHOLD) {
      target = null;
      return;
    }

    const node = locate(target);
    const event = node ? opts.getEvent(getID(node)) : null;
    target = null;

    if (opts.onEventPopup) {
      if (!event) {
        opts.onEventPopup(null);
        return;
      }
      opts.onEventPopup({
        eventId: event.id,
        element: node,
      });
    } else {
      if (!event) return;
      opts.exec('select-event', { id: event.id });
    }
  }

  node.addEventListener('mousedown', handleMouseDown);
  node.addEventListener('mouseup', handleMouseUp);

  return {
    update(newOpts) {
      opts = newOpts;
    },
    destroy() {
      node.removeEventListener('mousedown', handleMouseDown);
      node.removeEventListener('mouseup', handleMouseUp);
    },
  };
}
