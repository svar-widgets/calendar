import { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { Calendar, Editor, registerEditorItem } from '../../src/';
import { Comments } from '@svar-ui/react-comments';
import { Tasklist } from '@svar-ui/react-tasklist';
import { useStoreLater } from '@svar-ui/lib-react';
import { context } from '@svar-ui/react-core';
import { relDate } from '../data.js';
import DateTimeField from '../custom/DateTimeField.jsx';
import './Editor.css';

registerEditorItem('date-time', DateTimeField);
registerEditorItem('comments', Comments);
registerEditorItem('tasks', Tasklist);

const date = relDate(0);
const users = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Carol' },
];
const data = [
  {
    id: 1,
    text: 'Team planning',
    start: relDate(0, 9, 0),
    end: relDate(0, 11, 0),
    comments: [
      {
        id: 1,
        user: 2,
        content: "Agenda is ready, let's align on priorities.",
        date: relDate(-1, 10, 0),
      },
      {
        id: 2,
        user: 3,
        content: "I'll join remotely, please share the link.",
        date: relDate(-1, 11, 30),
      },
    ],
    tasks: [
      { id: 1, content: 'Book conference room', status: 1 },
      { id: 2, content: 'Send calendar invites', status: 1 },
      { id: 3, content: 'Prepare slides', status: 0 },
      { id: 4, content: 'Review Q2 goals', status: 0 },
    ],
  },
  {
    id: 2,
    text: 'Code review',
    start: relDate(0, 14, 0),
    end: relDate(0, 15, 0),
    comments: [],
    tasks: [
      { id: 1, content: 'Check PR #142', status: 0 },
      { id: 2, content: 'Update changelog', status: 0 },
    ],
  },
  {
    id: 3,
    text: 'Retrospective',
    start: relDate(1, 16, 0),
    end: relDate(1, 17, 0),
    comments: [],
    tasks: [],
  },
];

export default function EditorComments() {
  const { showModal } = useContext(context.helpers);
  const [api, setApi] = useState(null);
  const currentStartRef = useRef(null);

  const editorData = useStoreLater(api, 'editorData');
  const selected = editorData || null;

  useEffect(() => {
    if (selected) {
      currentStartRef.current = selected.start ?? null;
    }
  }, [selected]);

  function closeEditor() {
    if (api) api.exec('select-event', { id: null });
  }

  async function handleDelete() {
    if (!api || !selected) return;
    try {
      await showModal({
        title: 'Delete event?',
        message: 'This action cannot be undone.',
      });
    } catch {
      return;
    }
    api.exec('delete-event', { id: selected.id });
    closeEditor();
  }

  function handleChange({ key, value }) {
    // Wrapper handles the same-day end-date shift; we only mirror
    // `start` into local state so the `end` validation closure can
    // compare against the latest value.
    if (key === 'start') currentStartRef.current = value;
  }

  function handleAction({ item, changes }) {
    // Cancel button (`id: "close"`) is closed by the calendar Editor
    // wrapper itself. Save in autoSave-off mode finalises after the
    // editor empties its changes set; treat that as success and close.
    if (item.id === 'save' && changes.length === 0) closeEditor();
  }

  const items = useMemo(
    () => [
      {
        comp: 'text',
        key: 'text',
        label: 'Text',
        column: 'left',
        required: true,
      },
      {
        comp: 'date-time',
        key: 'start',
        label: 'Start date',
        required: true,
      },
      {
        comp: 'date-time',
        key: 'end',
        label: 'End date',
        required: true,
        validation: (v) =>
          v instanceof Date &&
          currentStartRef.current instanceof Date &&
          v > currentStartRef.current,
        validationMessage: 'End date must be after start date',
      },
      {
        key: 'comments',
        comp: 'comments',
        label: 'Comments',
        users,
        activeUser: 1,
        column: 'left',
      },
      { key: 'tasks', comp: 'tasks', label: 'Checklist' },
    ],
    [],
  );

  const bottomBar = useMemo(
    () => ({
      items: [
        {
          comp: 'button',
          id: 'delete',
          text: 'Delete',
          type: 'danger',
          onClick: handleDelete,
        },
        { comp: 'spacer' },
        {
          comp: 'button',
          id: 'close',
          text: 'Cancel',
          type: 'default',
        },
        {
          comp: 'button',
          id: 'save',
          text: 'Done',
          type: 'primary',
        },
      ],
    }),
    [api, selected],
  );

  useEffect(() => {
    if (api) api.exec('select-event', { id: 1 });
  }, [api]);

  return (
    <>
      <Calendar init={setApi} events={data} date={date} />
      {api && (
        <Editor
          api={api}
          items={items}
          bottomBar={bottomBar}
          topBar={false}
          autoSave={false}
          placement="modal"
          layout="columns"
          onChange={handleChange}
          onAction={handleAction}
          css="editor-custom"
        />
      )}
    </>
  );
}
