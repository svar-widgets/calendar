import { useState, useMemo } from 'react';
import { getData } from '../data.js';
import { Calendar, getToolbarItems } from '../../src/';
import { Layout } from '@svar-ui/react-layout';
import { Segmented } from '@svar-ui/react-core';

const defaultConfig = { items: getToolbarItems() };
const invertedConfig = {
  items: [
    { id: 'modes', comp: 'segmented' },
    { comp: 'spacer' },
    { id: 'title', comp: 'dateLabel' },
    { id: 'nav', comp: 'dateNav' },
  ],
};
const sidesConfig = {
  items: [
    { id: 'nav', comp: 'dateNav' },
    { id: 'title', comp: 'dateLabel' },
    { comp: 'spacer' },
    { id: 'modes', comp: 'segmented' },
  ],
};
const minimalConfig = {
  items: [{ comp: 'spacer' }, { id: 'modes', comp: 'segmented' }],
};
const noneConfig = { items: [] };

const modes = [
  { id: 'default', label: 'Default', config: defaultConfig },
  { id: 'sides', label: 'Sides', config: sidesConfig },
  { id: 'inverted', label: 'Inverted', config: invertedConfig },
  { id: 'minimal', label: 'Minimal', config: minimalConfig },
  { id: 'none', label: 'None', config: noneConfig },
];

export default function Toolbar() {
  const { data, date } = getData();
  const [mode, setMode] = useState('default');

  const toolbar = useMemo(
    () => modes.find((m) => m.id === mode)?.config,
    [mode],
  );

  return (
    <Layout direction="column">
      <Segmented
        options={modes}
        value={mode}
        onChange={(v) => setMode(v.value)}
      />
      <Calendar events={data} date={date} toolbar={toolbar} />
    </Layout>
  );
}
