import { DatePicker, TimePicker } from '@svar-ui/react-core';
import './DateTimePicker.css';

const scope = 'wx-aadDke8a';

export default function DateTimePicker({
  value,
  id,
  time,
  onChange,
  ...restProps
}) {
  return (
    <div className={`wx-event-calendar-date_field ${scope}`}>
      <div className={`wx-event-calendar-input_wrapper ${scope}`}>
        <DatePicker
          id={id}
          value={value}
          onChange={onChange}
          {...restProps}
          buttons={false}
        />
      </div>
      {time && <TimePicker id={id} value={value} onChange={onChange} />}
    </div>
  );
}
