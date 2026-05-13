import { useState, useRef } from 'react';
import { Calendar, Editor, parseICal, serializeICal } from '../../src/';
import { Button } from '@svar-ui/react-core';
import { Layout, Cell } from '@svar-ui/react-layout';
import { getData } from '../data.js';
import './ICalImportExport.css';

export default function ICalImportExportDemo() {
  const { data: initialData, date } = getData();
  const [data, setData] = useState(initialData);
  const [api, setApi] = useState(null);
  const fileInputRef = useRef(null);

  function importIcal(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setData(parseICal(ev.target.result));
    };
    reader.readAsText(file);
  }

  function exportIcal() {
    const events = api.getEvents();
    const ics = serializeICal(events);
    const blob = new Blob([ics], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calendar.ics';
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearAll() {
    setData([]);
  }

  return (
    <>
      <Layout>
        <Cell height={52} css="wx-toolbar-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".ics"
            onChange={importIcal}
            style={{ display: 'none' }}
          />
          <Button onClick={exportIcal}>Export .ics</Button>
          <Button onClick={clearAll}>Clear all</Button>
          <Button onClick={() => fileInputRef.current.click()}>
            Import .ics
          </Button>
        </Cell>
        <Calendar init={setApi} events={data} date={date} />
      </Layout>
      {api && <Editor api={api} />}
    </>
  );
}
