
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import { Store } from '../../../../types';
import createTestStore from '../../../../../test/createTestStore';
import createTestServices from '../../../../../test/createTestServices';
import MessageProvider from '../../../../MessageProvider';
import * as Services from '../../../../context/Services';
import UsingThisGuideButton from './UsingThisGuideButton';
import UsingThisGuideBanner from './UsingThisGuideBanner';

describe('Using this guide', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  const onclickFn = jest.fn;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
  });

  it('renders using this guide button correctly (when banner closed)', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <UsingThisGuideButton open={false} onClick={onclickFn}/>
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
          <UsingThisGuideBanner onClick={onclickFn}/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });
  
});
