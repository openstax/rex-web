import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { receiveFeatureFlags } from '../../../actions';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import { Store } from '../../../types';
import { studyGuidsFeatureFlag } from '../../constants';
import { receiveStudyGuides } from '../../studyGuides/actions';
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

  it('does not render if feature flag is enabled but books does not have study guides', () => {
    store.dispatch(receiveFeatureFlags([studyGuidsFeatureFlag]));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyGuidesButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('render if feature flag is enabled and books has study guides', () => {
    store.dispatch(receiveFeatureFlags([studyGuidsFeatureFlag]));
    store.dispatch(receiveStudyGuides({ asd: 'asdf' } as any));

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <StudyGuidesButton />
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  // Temporary test which should be updated after we add some onClick actions
  // like analytics tracking
  it('do nothing after click', () => {
    store.dispatch(receiveFeatureFlags([studyGuidsFeatureFlag]));
    store.dispatch(receiveStudyGuides({ asd: 'asdf' } as any));

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
  });
});
