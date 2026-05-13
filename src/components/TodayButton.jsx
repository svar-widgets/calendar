import { useContext } from 'react';
import { Button } from '@svar-ui/react-core';
import { context } from '@svar-ui/react-core';
import store from '../context.js';

export default function TodayButton() {
  const api = useContext(store);
  const locale = useContext(context.i18n);
  const _ = locale.getGroup('eventCalendar');

  function today() {
    api.exec('navigate-time', { direction: 'now' });
  }

  return <Button onClick={today}>{_('Today')}</Button>;
}
