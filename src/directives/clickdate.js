const CLICK_THRESHOLD = 3;

export function clickdate(node, options) {
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

    const el = target.closest('[data-date]');
    target = null;

    if (!el) return;

    const raw = el.getAttribute('data-date');
    if (!raw) return;

    const [y, m, d] = raw.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    opts.exec('navigate-to', { date, view: 'day' });
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
