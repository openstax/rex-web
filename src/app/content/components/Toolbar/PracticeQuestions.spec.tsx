import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { receiveFeatureFlags } from '../../../actions';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { practiceQuestionsFeatureFlag } from '../../constants';
import { openPracticeQuestions } from '../../practiceQuestions/actions';
import PracticeQuestionsButton, { PracticeQuestionsWrapper } from './PracticeQuestionsButton';

describe('practice questions button', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;
  let dispatch: jest.SpyInstance;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('does not render if feature flag is not enabled', () => {
    store.dispatch(receiveFeatureFlags([]));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('render if feature flag is enabled', () => {
    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('clicking button opens modal', () => {
    const spyTrack = jest.spyOn(services.analytics.openClosePracticeQuestions, 'track');

    store.dispatch(receiveFeatureFlags([practiceQuestionsFeatureFlag]));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <PracticeQuestionsButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      const button = component.root.findByType(PracticeQuestionsWrapper);
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenLastCalledWith(openPracticeQuestions());
    expect(spyTrack).toHaveBeenCalled();
  });
});
