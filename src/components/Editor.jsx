import { useState, useMemo, useContext } from 'react';
import { Editor as EditorBase, registerEditorItem } from '@svar-ui/react-editor';
import { useStore } from '@svar-ui/lib-react';
import { locale } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/calendar-locales';
import { en as coreEn } from '@svar-ui/core-locales';
import { context } from '@svar-ui/react-core';
import DateTimePicker from './DateTimePicker.jsx';
import { getEditorItems } from './editorItems.js';

import './Editor.css';

registerEditorItem('date-time-picker', DateTimePicker);

export default function Editor({
  api,
  values,
  items = getEditorItems(),
  placement = 'sidebar',
  layout = 'default',
  focus = true,
  css = '',
  topBar,
  autoSave = true,
  onChange,
  onSave,
  onAction,
  ...editorProps
}) {
  void values;

  const editorDataValue = useStore(api, 'editorData');

  let l = useContext(context.i18n);
  if (!l) {
    l = locale({ ...en, ...coreEn });
  }
  const _ = l.getGroup('eventCalendar');

  function translate(value) {
    return typeof value === 'string' ? _(value) : value;
  }

  function applyLocale(list) {
    return list.map((item) => {
      const next = { ...item };
      next.label = translate(next.label);
      return next;
    });
  }

  const [generation, setGeneration] = useState(1);

  const allDay = useMemo(
    () => (generation > 0 ? editorDataValue?.allDay : false),
    [generation, editorDataValue],
  );

  const cItems = useMemo(() => applyLocale(items), [items, _]);

  function handleDelete() {
    const data = editorDataValue;
    if (!data) return;
    api.exec('delete-event', { id: data.id });
    api.exec('select-event', { id: null });
  }

  const defaultTopBar = {
    items: [
      { comp: 'icon', icon: 'wxi-close', id: 'close' },
      { comp: 'spacer' },
      {
        comp: 'button',
        id: 'delete',
        text: _('Delete'),
        type: 'primary danger',
        onClick: handleDelete,
      },
    ],
  };

  const editorTopBar = topBar === undefined ? defaultTopBar : topBar;

  const editorCss = useMemo(
    () =>
      ['wx-editor-calendar', allDay ? 'wx-editor-all-day' : '', css]
        .filter(Boolean)
        .join(' '),
    [allDay, css],
  );

  function sameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function handleSave(ev) {
    onSave?.(ev);
    const data = editorDataValue;
    if (!data) return;
    api.exec('update-event', { id: data.id, event: { ...ev.values } });
  }

  function handleChange(ev) {
    const { key, value, update } = ev;
    const prev = editorDataValue;
    setGeneration((g) => g + 1);

    if (prev && key === 'start' && !update.allDay) {
      const oldStart = prev.start;
      const oldEnd = prev.end;
      if (
        oldStart instanceof Date &&
        oldEnd instanceof Date &&
        sameDay(oldStart, oldEnd) &&
        value instanceof Date
      ) {
        const newEnd = new Date(oldEnd);
        newEnd.setFullYear(
          value.getFullYear(),
          value.getMonth(),
          value.getDate(),
        );
        update.end = newEnd;
      }
    }
    onChange?.(ev);
  }

  function handleAction(ev) {
    onAction?.(ev);
    const { item } = ev;
    if (item.id === 'close' && !!item.comp) {
      api.exec('select-event', { id: null });
    }
  }

  return (
    editorDataValue && (
      <EditorBase
        {...editorProps}
        focus={focus}
        items={cItems}
        topBar={editorTopBar}
        autoSave={autoSave}
        onChange={handleChange}
        onAction={handleAction}
        onSave={handleSave}
        placement={placement}
        layout={layout}
        values={editorDataValue}
        css={editorCss}
      />
    )
  );
}
