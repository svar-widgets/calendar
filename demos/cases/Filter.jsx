import { useContext, useRef, useState } from 'react';
import { getData } from '../data.js';
import { Calendar } from '../../src/';
import { context, Segmented } from '@svar-ui/react-core';
import { Layout, Cell } from '@svar-ui/react-layout';
import {
  Willow,
  WillowDark,
  FilterQuery,
  FilterBar,
  FilterBuilder,
  createFilter,
  getQueryString,
} from '@svar-ui/react-filter';
import './Filter.css';

export default function FilterDemo() {
  const { data, date } = getData();
  const helpers = useContext(context.helpers);
  const apiRef = useRef(null);
  const [mode, setMode] = useState('plain');
  const [textValue, setTextValue] = useState('');

  function onInit(obj) {
    apiRef.current = obj;
  }

  const fields = [
    { id: 'text', label: 'Text', type: 'text' },
    { id: 'start', label: 'Start Date', type: 'date' },
    { id: 'end', label: 'End Date', type: 'date' },
  ];

  const url = 'https://filter-backend.svar.dev/text-to-json';

  async function text2filter(text, fields) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ text, fields }),
    });
    const json = await response.json();
    if (!response.ok) {
      helpers.showNotice({
        text: json.error || 'Request failed',
        type: 'danger',
      });
      return null;
    }
    return json;
  }

  function applyFilter({ value }) {
    apiRef.current.exec('filter-events', {
      filter: createFilter(value),
    });
  }

  async function applyQueryFilter({
    value,
    error,
    text,
    startProgress,
    endProgress,
  }) {
    if (text) {
      error = null;
      try {
        startProgress();
        value = await text2filter(text, fields);
        setTextValue(value ? getQueryString(value).query : '');
      } catch (e) {
        error = e;
      } finally {
        endProgress();
      }
    }

    if (error) {
      helpers.showNotice({
        text: error.message,
        type: 'danger',
      });

      if (error.code !== 'NO_DATA') return;
    }

    apiRef.current.exec('filter-events', {
      filter: createFilter(value, {}, fields),
    });
  }

  return (
    <>
      <Willow />
      <WillowDark />
      <Layout preset="space">
        <Segmented
          value={mode}
          onChange={({ value }) => setMode(value)}
          options={[
            { id: 'plain', label: 'Plain' },
            { id: 'query', label: 'Query' },
            { id: 'builder', label: 'Builder' },
          ]}
        />
        {mode === 'plain' && (
          <FilterBar debounce={0} fields={[fields[0]]} onChange={applyFilter} />
        )}
        {mode === 'query' && (
          <FilterQuery
            value={textValue}
            fields={fields}
            onChange={applyQueryFilter}
            placeholder="type your query as plain text"
          />
        )}
        {mode === 'builder' && (
          <FilterBuilder fields={fields} type="line" onChange={applyFilter} />
        )}
        <Cell>
          <Calendar events={data} date={date} init={onInit} />
        </Cell>
      </Layout>
    </>
  );
}
