import { useState, useContext, useMemo } from 'react';
import { getData } from '../data.js';
import { Calendar, ContextMenu, Editor, getMenuOptions } from '../../src/';
import { context } from '@svar-ui/react-core';

export default function ContextMenuDemo() {
  const helpers = useContext(context.helpers);
  const { data, date } = getData();
  const [api, setApi] = useState(null);

  const options = useMemo(
    () => [
      ...getMenuOptions(),
      { id: 'my-action', text: 'My action', icon: 'wxi-empty' },
    ],
    [],
  );

  function onClick({ action }) {
    if (action.id === 'my-action') {
      helpers.showNotice({
        text: '`My action` clicked',
        type: 'success',
      });
    }
  }

  return (
    <>
      <ContextMenu api={api} options={options} onClick={onClick}>
        <Calendar init={setApi} events={data} date={date} />
      </ContextMenu>
      {api && <Editor api={api} />}
    </>
  );
}
