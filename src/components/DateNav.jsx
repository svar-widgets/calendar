import { useContext } from 'react';
import { Button } from '@svar-ui/react-core';
import { context } from '@svar-ui/react-core';
import store from '../context.js';
import './DateNav.css';

const scope = 'wx-aadwaVAO';

export default function DateNav() {
  const api = useContext(store);
  const locale = useContext(context.i18n);
  const _ = locale.getGroup('eventCalendar');

  function next() {
    api.exec('navigate-time', { direction: 'next' });
  }

  function prev() {
    api.exec('navigate-time', { direction: 'previous' });
  }

  return (
    <div
      className={`wx-date-nav ${scope}`}
      role="group"
      aria-label={_('Date navigation')}
    >
      <Button icon="wxi-angle-left" onClick={prev} />
      <Button icon="wxi-angle-right" onClick={next} />
    </div>
  );
}
