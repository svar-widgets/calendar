import { useContext } from 'react';
import { Button } from '@svar-ui/react-core';
import store from '../context.js';

export default function MenuButton() {
  const api = useContext(store);

  function menuClick() {
    api.exec('action', { id: 'menu-button' });
  }

  return <Button icon="wxi-menu" onClick={menuClick} />;
}
