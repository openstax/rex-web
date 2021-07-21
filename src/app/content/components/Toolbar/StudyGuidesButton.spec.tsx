import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import * as Services from '../../../context/Services';
import { receiveFeatureFlags } from '../../../featureFlags/actions';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { studyGuidesFeatureFlag } from '../../constants';
import { CountsPerSource } from '../../highlights/types';
import { receiveStudyGuidesTotalCounts } from '../../studyGuides/actions';
import StudyGuidesButton, { StudyGuidesWrapper } from './StudyGuidesButton';

describe('study guides button', () => {
  let store: Store;
  let services: ReturnType<typeof createTestServices>;

  beforeEach(() => {
    store = createTestStore();
    services = createTestServices();
  });

  it('does not render if feature flag is not enabled', () => {
    store.dispatch(receiveFeatureFlags([]));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyGuidesButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('does not render if feature flag is enabled but book does not have study guide', () => {
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyGuidesButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('render if feature flag is enabled and book has study guide', () => {
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));
    store.dispatch(receiveStudyGuidesTotalCounts({ countsPerSource: { asd: { green: 1 } } } as CountsPerSource));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyGuidesButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('clicking button triggers analytics event', () => {
    const spyTrack = jest.spyOn(services.analytics.openStudyGuides, 'track');

    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));
    store.dispatch(receiveStudyGuidesTotalCounts({ countsPerSource: { asd: { green: 1 } } } as CountsPerSource));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyGuidesButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      const button = component.root.findByType(StudyGuidesWrapper);
      button.props.onClick();
    });

    expect(spyTrack).toHaveBeenCalled();
  });
});
