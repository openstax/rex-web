import React from 'react';
import { RawIntlProvider } from 'react-intl';
import * as redux from '../../../helpers/redux-bridge';
import { Provider } from '../../../helpers/redux-bridge';
import renderer from 'react-test-renderer';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import * as Services from '../../context/Services';
import createIntl from '../../messages/createIntl';
import { MiddlewareAPI, Store } from '../../types';
import { setTextSize } from '../actions';
import { LinkedArchiveTreeSection } from '../types';
import { AssignedTopBar } from './AssignedTopBar';
import { assertDocument, assertWindow } from '../../utils/browser-assertions';

jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('AssignedTopBar', () => {
  const windowBack = assertWindow();
  const addEventListenerBackup = windowBack.addEventListener;
  let addEventListener: jest.SpyInstance;
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    addEventListener = jest.spyOn(windowBack, 'addEventListener');

    store.dispatch(setTextSize(0));
  });

  afterEach(() => {
    windowBack.addEventListener = addEventListenerBackup;
  });

  it('renders', async() => {
    const dispatch = jest.fn();
    jest.spyOn(redux, 'useDispatch').mockImplementation(() => dispatch);

    const section = { title: '1.1 Section Title' } as LinkedArchiveTreeSection;
    const intl = await createIntl('en');

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <AssignedTopBar section={section} />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    expect(tree.toJSON()).toMatchSnapshot();

    renderer.act(() => {
      tree.root.findByProps({
        'data-testid': 'text-resizer',
      }).props.setTextSize(2);
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setTextSize(2));

    tree.unmount();
  });

  it('renders null with textSize integration', async() => {
    services.launchToken = {tokenString: '', tokenData: {textSize: 2}};

    const section = { title: '1.1 Section Title' } as LinkedArchiveTreeSection;
    const intl = await createIntl('en');

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <AssignedTopBar section={section} />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    expect(tree.toJSON()).toMatchSnapshot();

    tree.unmount();
  });

  it('handles font size from postmessage', async() => {
    const dispatch = jest.fn();
    Object.defineProperty(assertWindow(), 'parent', {value: {...assertWindow()}});
    Object.defineProperty(assertDocument(), 'referrer', {value: assertWindow().location.toString()});
    services.launchToken = {tokenString: '', tokenData: {textSize: 2}};
    jest.spyOn(redux, 'useDispatch').mockImplementation(() => dispatch);

    const section = { title: '1.1 Section Title' } as LinkedArchiveTreeSection;
    const intl = await createIntl('en');

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <AssignedTopBar section={section} />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    renderer.act(() => {
      addEventListener.mock.calls.forEach(([event, handler]) => {
        if (event === 'message') {
          handler({
            data: {type: 'TextSizeUpdate', value: 2},
            origin: assertWindow().location.origin,
          });
        }
      });
    });

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(setTextSize(2));

    tree.unmount();
  });

  it('ignores postmessages from weird origins', async() => {
    const dispatch = jest.fn();
    Object.defineProperty(assertWindow(), 'parent', {value: {...assertWindow()}});
    Object.defineProperty(assertDocument(), 'referrer', {value: assertWindow().location.toString()});
    services.launchToken = {tokenString: '', tokenData: {textSize: 2}};
    jest.spyOn(redux, 'useDispatch').mockImplementation(() => dispatch);

    const section = { title: '1.1 Section Title' } as LinkedArchiveTreeSection;
    const intl = await createIntl('en');

    const tree = renderer.create(
      <Provider store={store}>
        <RawIntlProvider value={intl}>
          <Services.Provider value={services}>
            <AssignedTopBar section={section} />
          </Services.Provider>
        </RawIntlProvider>
      </Provider>
    );

    renderer.act(() => {
      addEventListener.mock.calls.forEach(([event, handler]) => {
        if (event === 'message') {
          handler({
            data: {type: 'TextSizeUpdate', value: 2},
            origin: 'https://google.com',
          });
        }
      });
    });

    expect(dispatch).not.toHaveBeenCalled();

    tree.unmount();
  });
});
