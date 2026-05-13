import { useContext } from 'react';
import { useStore } from '@svar-ui/lib-react';
import store from '../context.js';
import './DateLabel.css';

const scope = 'wx-aadmBVgZ';

export default function DateLabel() {
  const api = useContext(store);
  const rangeLabelValue = useStore(api, 'rangeLabel');

  return (
    <span
      className={`wx-date-label ${scope}`}
      role="heading"
      aria-level="2"
      aria-live="polite"
      aria-atomic="true"
    >
      {rangeLabelValue}
    </span>
  );
}
