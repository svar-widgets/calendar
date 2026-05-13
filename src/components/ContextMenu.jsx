import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import { ContextMenu as ContextMenuBase } from '@svar-ui/react-menu';
import { locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/calendar-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { getMenuOptions } from '@svar-ui/calendar-store';
import { context } from '@svar-ui/react-core';

const CalendarContextMenu = forwardRef(function CalendarContextMenu(
  {
    options = [],
    api = null,
    resolver = null,
    filter = null,
    at = 'point',
    children,
    onClick,
    css,
  },
  ref,
) {
  const menuRef = useRef(null);
  const activeIdRef = useRef(null);

  let l = useContext(context.i18n);
  if (!l) {
    l = locale({ ...en, ...coreEn });
  }
  const _ = l.getGroup('eventCalendar');

  useImperativeHandle(ref, () => ({
    show(ev, obj) {
      menuRef.current?.show(ev, obj);
    },
  }));

  function applyLocale(opts) {
    return opts.map((op) => {
      op = { ...op };
      if (op.text) op.text = _(op.text);
      if (op.subtext) op.subtext = _(op.subtext);
      if (op.data) op.data = applyLocale(op.data);
      return op;
    });
  }

  function getOptions() {
    const base = options.length ? options : getMenuOptions();
    return applyLocale(base);
  }

  const cOptions = useMemo(() => getOptions(), [options, _]);

  const itemResolver = useCallback(
    (rawId, ev) => {
      if (!rawId || !api) return null;

      const event = api.getEvent(rawId);
      if (!event) return null;

      if (resolver) {
        const result = resolver(event, ev);
        if (!result) return null;
      }

      activeIdRef.current = event.id;

      return event;
    },
    [api, resolver],
  );

  const menuAction = useCallback(
    (ev) => {
      const action = ev?.action;
      if (!action) return;

      const activeId = activeIdRef.current;
      const id = typeof activeId === 'object' ? activeId.id : activeId;

      if (action.id === 'edit-event') {
        api.exec('select-event', { id });
      } else if (action.id === 'delete-event') {
        api.exec('delete-event', { id });
      }

      onClick?.(ev);
    },
    [api, onClick],
  );

  const filterMenu = useCallback(
    (item, event) => {
      return filter ? filter(item, event) : true;
    },
    [filter],
  );

  return (
    <>
      <ContextMenuBase
        filter={filterMenu}
        options={cOptions}
        dataKey="id"
        resolver={itemResolver}
        onClick={menuAction}
        css={css}
        at={at}
        ref={menuRef}
      />
      <span
        className="wx-aaav2I8x"
        onContextMenu={(e) => menuRef.current?.show(e)}
        data-menu-ignore="true"
      >
        {children}
      </span>
    </>
  );
});

export default CalendarContextMenu;
