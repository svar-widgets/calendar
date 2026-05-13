import {
  useEffect,
  useMemo,
  useRef,
  useContext,
  forwardRef,
  useImperativeHandle,
} from 'react';

// locales
import { locale as l, dateToString } from '@svar-ui/lib-dom';
import { en } from '@svar-ui/calendar-locales';
import { en as coreEn } from '@svar-ui/core-locales';

// stores
import { EventBusRouter } from '@svar-ui/lib-state';
import { CalendarStore } from '@svar-ui/calendar-store';
import { writable } from '@svar-ui/lib-react';

// context
import { context } from '@svar-ui/react-core';
import store from '../context.js';

// ui
import Layout from './Layout.jsx';

const camelize = (s) =>
  s
    .split('-')
    .map((part) => (part ? part.charAt(0).toUpperCase() + part.slice(1) : ''))
    .join('');

const Widget = forwardRef(function Widget(props, ref) {
  const {
    events,
    init,
    view = 'day',
    date,
    views = ['day', 'week', 'month'],
    toolbar,
    cellCss,
    eventCss,
    eventContent,
    recurring = false,
    readonly = false,
    children,
    tooltip,
    eventPopup,
    ...restProps
  } = props;

  // uses same logic as the Locale component
  const words = useMemo(() => ({ ...coreEn, ...en }), []);

  const parentLocale = useContext(context.i18n);
  const locale = useMemo(() => {
    if (!parentLocale) return l(words);
    return parentLocale.extend(words, true);
  }, [parentLocale, words]);

  // create date format helper that resolves format names and format strings
  const rawLocale = locale.getRaw();
  const fmt = useMemo(() => {
    return (format) => {
      const resolved = rawLocale?.eventCalendar?.[format] ?? format;
      return dateToString(resolved, rawLocale?.calendar);
    };
  }, [rawLocale]);

  // Keep a ref to restProps so the event router always calls the latest handlers
  const restPropsRef = useRef(restProps);
  restPropsRef.current = restProps;

  // init stores (stable references across renders)
  const storeRef = useRef(null);
  if (!storeRef.current) {
    const dataStore = new CalendarStore(writable, {
      recurring,
      weekStart: rawLocale?.calendar?.weekStart ?? 1,
      dateFormat: fmt,
    });

    // define event route
    const firstInRoute = dataStore.in;

    const lastInRoute = new EventBusRouter((a, b) => {
      const name = 'on' + camelize(a);
      const handler = restPropsRef.current[name];
      if (handler) {
        handler(b);
      }
    });
    firstInRoute.setNext(lastInRoute);

    // common API available in components
    const stateStore = {
      getState: dataStore.getState.bind(dataStore),
      getReactiveState: dataStore.getReactive.bind(dataStore),
      exec: firstInRoute.exec.bind(firstInRoute),
      getEvent: dataStore.getEvent.bind(dataStore),
      fmt,
    };

    storeRef.current = {
      dataStore,
      firstInRoute,
      lastInRoute,
      stateStore,
    };
  }

  const { dataStore, firstInRoute, lastInRoute, stateStore } = storeRef.current;

  // viewOptions derived from views prop
  const viewOptions = useMemo(
    () =>
      views.map((v) => {
        if (typeof v === 'string') {
          return { id: v };
        }
        return { ...v };
      }),
    [views],
  );

  const api = useMemo(
    () => ({
      exec: firstInRoute.exec.bind(firstInRoute),
      setNext: (ev) => lastInRoute.setNext(ev),
      intercept: firstInRoute.intercept.bind(firstInRoute),
      on: firstInRoute.on.bind(firstInRoute),
      detach: firstInRoute.detach.bind(firstInRoute),
      getState: dataStore.getState.bind(dataStore),
      getReactiveState: dataStore.getReactive.bind(dataStore),
      getStores: () => ({ data: dataStore }),
      getEvents: dataStore.getEvents.bind(dataStore),
      getEvent: dataStore.getEvent.bind(dataStore),
    }),
    [storeRef.current],
  );

  // expose API via ref
  useImperativeHandle(
    ref,
    () => ({
      ...api,
    }),
    [api],
  );

  const initOnceRef = useRef(0);
  useEffect(() => {
    if (!initOnceRef.current) {
      if (init) init(api);
    } else {
      dataStore.configureViews(viewOptions);
      dataStore.init({
        currentView: view,
        currentDate: date,
        events,
      });
    }
    initOnceRef.current++;
  }, [view, date, events, viewOptions]);

  if (initOnceRef.current === 0) {
    dataStore.configureViews(viewOptions);
    dataStore.init({
      currentView: view,
      currentDate: date,
      events,
    });
  }

  return (
    <context.i18n.Provider value={locale}>
      <store.Provider value={stateStore}>
        <Layout
          store={stateStore}
          views={viewOptions}
          brandmark={dataStore.getBrandmark()}
          toolbar={toolbar}
          cellCss={cellCss}
          eventCss={eventCss}
          eventContent={eventContent}
          readonly={readonly}
          tooltip={tooltip}
          eventPopup={eventPopup}
        >
          {children}
        </Layout>
      </store.Provider>
    </context.i18n.Provider>
  );
});

export default Widget;
