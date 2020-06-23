import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import * as Services from '../../../context/Services';
import MessageProvider from '../../../MessageProvider';
import * as reactUtils from '../../../reactUtils';
import { AppServices, Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { closeNudgeStudyTools, openNudgeStudyTools } from '../../actions';
import * as contentSelect from '../../selectors';
import * as studyGuidesSelect from '../../studyGuides/selectors';
import NudgeStudyTools from './';
import arrowMobile from './assets/arrowMobile.svg';
import { NudgeArrow, NudgeCloseButton } from './styles';
import * as utils from './utils';

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (component: any) => component,
}));

describe('NudgeStudyTools', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: AppServices;

  beforeEach(() => {
    document = assertDocument();

    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    services = createTestServices();
  });

  it('sets cookies, opens nudge and track opening if all requirement passes', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(true);
    jest.spyOn(utils, 'shouldDisplayNudgeStudyTools')
      .mockReturnValue(true);
    const spySetCookies = jest.spyOn(utils, 'setNudgeStudyToolsCookies');
    const spyTrack = jest.spyOn(services.analytics.openNudgeStudyTools, 'track');

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    // Call useEffect hooks
    component.update(() => null);

    expect(spySetCookies).toHaveBeenCalled();
    expect(spyTrack).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(openNudgeStudyTools());
  });

  it('does not render if not open', () => {
    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('does not render if open but without positions', () => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('renders only if open and if positions have been calculated', async() => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    jest.spyOn(utils, 'usePositions')
      .mockReturnValue({
        arrowLeft: 1200,
        arrowTopOffset: 245,
        closeButtonLeft: 1500,
        closeButtonTopOffset: 345,
        contentWrapperRight: -486,
        contentWrapperTopOffset: 385,
        spotlightHeight: 45,
        spotlightLeftOffset: 1190,
        spotlightTopOffset: 190,
        spotlightWidth: 300,
      });

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('dispatches action on clicking close button and tests if body has overflow style set to hidden', async() => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    jest.spyOn(reactUtils, 'useDebouncedMatchMobileQuery')
      .mockReturnValue(true);

    jest.spyOn(utils, 'usePositions')
      .mockReturnValue({
        arrowLeft: 1200,
        arrowTopOffset: 245,
        closeButtonLeft: 1500,
        closeButtonTopOffset: 345,
        contentWrapperRight: -486,
        contentWrapperTopOffset: 385,
        spotlightHeight: 45,
        spotlightLeftOffset: 1190,
        spotlightTopOffset: 190,
        spotlightWidth: 300,
      });

    const component = renderer.create(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    renderer.act(() => {
      expect(assertDocument().body.style.overflow).toEqual('hidden');
    });

    renderer.act(() => {
      const arrow = component.root.findByType(NudgeArrow);
      expect(arrow.props.src).toEqual(arrowMobile);
      const button = component.root.findByType(NudgeCloseButton);
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeNudgeStudyTools());
  });
});
