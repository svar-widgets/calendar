import { useState, useMemo } from 'react';
import { getData } from '../data.js';
import { Calendar, Editor } from '../../src/';
import { Layout } from '@svar-ui/react-layout';
import { Segmented, Locale } from '@svar-ui/react-core';
import { en as enCore, cn as cnCore } from '@svar-ui/core-locales';
import { en, cn } from '@svar-ui/calendar-locales';

const dictionaries = {
  en: { calendar: en, core: enCore },
  cn: { calendar: cn, core: cnCore },
};

const options = [
  { id: 'en', label: 'English' },
  { id: 'cn', label: 'Chinese' },
];

export default function Locales() {
  const { data, date } = getData();
  const [api, setApi] = useState(null);
  const [locale, setLocale] = useState('en');

  const words = useMemo(
    () => ({
      ...dictionaries[locale].calendar,
      ...dictionaries[locale].core,
    }),
    [locale],
  );

  return (
    <Layout direction="column">
      <Segmented
        options={options}
        value={locale}
        onChange={(v) => setLocale(v.value)}
      />
      <Locale key={locale} words={words}>
        <Calendar init={setApi} events={data} view="week" date={date} />
        {api && <Editor api={api} />}
      </Locale>
    </Layout>
  );
}
