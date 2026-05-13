import { DatePicker, TimePicker } from '@svar-ui/react-core';
import './DateTimeField.css';

export default function DateTimeField({ value, id, onchange }) {
  return (
    <div className="wx-date-time-field wx-aadfEdWd">
      <div className="date wx-aadfEdWd">
        <DatePicker id={id} value={value} onchange={onchange} buttons={false} />
      </div>
      <TimePicker id={id} value={value} onchange={onchange} />
    </div>
  );
}
