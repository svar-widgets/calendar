import { useContext } from 'react';
import { context } from '@svar-ui/react-core';
import { useStore } from '@svar-ui/lib-react';
import Navigation from './Navigation.jsx';
import Sections from './Render/Sections.jsx';
import ScrollableSection from './Render/ScrollableSection.jsx';

import './Layout.css';

const str2style = (s) => {
  const obj = {};

  s.split(';').forEach((kv) => {
    const [k, v] = kv.split(':');
    if (k && v) obj[k.trim()] = v.trim();
  });
  return obj;
};

function Layout({
  store,
  views,
  toolbar,
  cellCss,
  eventCss,
  eventContent,
  children,
  tooltip,
  eventPopup,
  brandmark,
  readonly = false,
}) {
  const locale = useContext(context.i18n);
  const _ = locale.getGroup('eventCalendar');

  const viewDataValue = useStore(store, 'viewData');
  const currentViewValue = useStore(store, 'currentView');
  const viewValue = useStore(store, '_view');

  const renderMode = viewValue?.render;

  function viewContent() {
    if (renderMode === 'scrollable') {
      return (
        <ScrollableSection
          data={viewDataValue}
          cellCss={cellCss}
          eventCss={eventCss}
          eventContent={eventContent}
          view={currentViewValue}
          tooltip={tooltip}
          eventPopup={eventPopup}
          readonly={readonly}
        />
      );
    }
    return (
      <Sections
        data={viewDataValue}
        cellCss={cellCss}
        eventCss={eventCss}
        eventContent={eventContent}
        view={currentViewValue}
        tooltip={tooltip}
        eventPopup={eventPopup}
        readonly={readonly}
      />
    );
  }

  return (
    <div
      className="wx-calendar wx-aaccgHBn"
      role="region"
      aria-label={_('Calendar')}
    >
      {toolbar !== null && (
        <Navigation views={views} toolbar={toolbar} readonly={readonly} />
      )}
      {children ? (
        <div className="wx-layout-content wx-aaccgHBn">
          <div
            className="wx-layout-sidebar wx-aaccgHBn"
            role="complementary"
            aria-label={_('Calendar sidebar')}
          >
            {children}
          </div>
          <div className="wx-layout-main wx-aaccgHBn">
            {viewContent()}
            {brandmark && (
              <a
                style={str2style(brandmark.style)}
                href={brandmark.link}
                target="_blank"
                rel="noreferrer"
              >
                {brandmark.text}
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="wx-layout-main wx-layout-main--full wx-aaccgHBn">
          {viewContent()}
          {brandmark && (
            <a
              style={str2style(brandmark.style)}
              href={brandmark.link}
              target="_blank"
              rel="noreferrer"
            >
              {brandmark.text}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default Layout;
