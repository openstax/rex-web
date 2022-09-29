import React from 'react';
import { RawIntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { LinkedArchiveTreeSection } from '../types';
import createTestServices from '../../../test/createTestServices';
import createTestStore from '../../../test/createTestStore';
import * as Services from '../../context/Services';
import createIntl from '../../messages/createIntl';
import { MiddlewareAPI, Store } from '../../types';
import { AssignedTopBar } from './AssignedTopBar';
import * as redux from 'react-redux';
import { setTextSize } from '../actions';

describe('AssignedTopBar', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };

    store.dispatch(setTextSize(0));
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
});
