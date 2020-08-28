
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../../test/createTestServices';
import createTestStore from '../../../../../test/createTestStore';
import * as Services from '../../../../context/Services';
import MessageProvider from '../../../../MessageProvider';
import { Store } from '../../../../types';
import UsingThisGuideBanner from './UsingThisGuideBanner';
import UsingThisGuideButton from './UsingThisGuideButton';

describe('Using this guide', () => {
  const onclickFn = jest.fn();
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    services = createTestServices();
    store = createTestStore();
  });

  it('renders using this guide button correctly (when banner closed)', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <UsingThisGuideBanner isOpenedForTheFirstTime={false} show={false} onClick={onclickFn}/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide button correctly (when banner open)', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <UsingThisGuideButton open={true} onClick={onclickFn}/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders using this guide banner correctly', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <UsingThisGuideBanner isOpenedForTheFirstTime={false} show={true} onClick={onclickFn}/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });
});
