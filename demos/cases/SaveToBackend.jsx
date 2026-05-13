import { useState, useEffect, useRef } from 'react';
import { Calendar, Editor } from '../../src/';
import { RestDataProvider } from '@svar-ui/calendar-provider';

const server = 'https://calendar-backend.svar.dev';

export default function SaveToBackendDemo() {
  const providerRef = useRef(new RestDataProvider(server));
  const [api, setApi] = useState(null);
  const [data, setData] = useState([]);
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    providerRef.current.getData().then((events) => {
      setData(events);
      setDate(new Date(events[0].start));
    });
  }, []);

  function handleInit(api) {
    setApi(api);
    api.setNext(providerRef.current);
  }

  return (
    <>
      <Calendar init={handleInit} events={data} date={date} />
      {api && <Editor api={api} />}
    </>
  );
}
