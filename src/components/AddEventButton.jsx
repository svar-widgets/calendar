import { useContext } from 'react';
import { Button } from '@svar-ui/react-core';
import store from '../context.js';

export default function AddEventButton() {
  const api = useContext(store);

  function addEvent() {
    api.exec('add-event', { event: {}, edit: true });
  }

  return <Button icon="wxi-plus" type="primary" onClick={addEvent} />;
}
