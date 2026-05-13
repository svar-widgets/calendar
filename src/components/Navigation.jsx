import { useContext, useMemo } from 'react';
import { Toolbar, registerToolbarItem } from '@svar-ui/react-toolbar';
import { RichSelect, Segmented } from '@svar-ui/react-core';
import { getToolbarItems } from '@svar-ui/calendar-store';
import { useStore } from '@svar-ui/lib-react';
import { context } from '@svar-ui/react-core';
import store from '../context.js';
import DateNav from './DateNav.jsx';
import TodayButton from './TodayButton.jsx';
import DateLabel from './DateLabel.jsx';
import MenuButton from './MenuButton.jsx';
import AddEventButton from './AddEventButton.jsx';

import './Navigation.css';

registerToolbarItem('richselect', RichSelect);
registerToolbarItem('segmented', Segmented);
registerToolbarItem('dateNav', DateNav);
registerToolbarItem('todayButton', TodayButton);
registerToolbarItem('dateLabel', DateLabel);
registerToolbarItem('menuButton', MenuButton);
registerToolbarItem('addEventButton', AddEventButton);

export default function Navigation({
  views,
  toolbar = { items: getToolbarItems() },
  readonly = false,
}) {
  const api = useContext(store);
  const locale = useContext(context.i18n);
  const _ = locale.getGroup('eventCalendar');

  const currentViewValue = useStore(api, 'currentView');

  const items = useMemo(() => {
    const base = toolbar?.items;
    const viewOptions = views.map((v) => ({
      id: v.id,
      label: _(v.label || v.id.charAt(0).toUpperCase() + v.id.slice(1)),
    }));

    const res = [...(base ?? [])]
      .map((item) => {
        if (item.id === 'modes') {
          if (viewOptions.length > 1) {
            return {
              ...item,
              value: currentViewValue,
              options: viewOptions,
            };
          } else {
            return null;
          }
        }
        if (readonly && item.comp === 'addEventButton') return null;
        return item;
      })
      .filter(Boolean);
    return res;
  }, [toolbar, views, currentViewValue, readonly, _]);

  const onChange = ({ item, value }) => {
    if (item.id === 'modes') {
      api.exec('navigate-to', { view: value });
    }
  };

  return (
    <div
      className="wx-navigation wx-aaeySLof"
      role="navigation"
      aria-label={_('Calendar controls')}
    >
      <Toolbar items={items} onChange={onChange} css={toolbar?.css} />
    </div>
  );
}
