import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import {v4 as uuid} from 'uuid';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import MessageProvider from '../../../../test/MessageProvider';
import { makeFindByTestId } from '../../../../test/reactutils';
import { runHooks } from '../../../../test/utils';
import * as Services from '../../../context/Services';
import { receiveFeatureFlags } from '../../../featureFlags/actions';
import * as reactUtils from '../../../reactUtils';
import { AppServices, MiddlewareAPI, Store } from '../../../types';
import { assertDocument } from '../../../utils';
import { closeNudgeStudyTools, openNudgeStudyTools } from '../../actions';
import { studyGuidesFeatureFlag } from '../../constants';
import { openMyHighlights } from '../../highlights/actions';
import * as contentSelect from '../../selectors';
import { openStudyGuides, receiveStudyGuidesTotalCounts } from '../../studyGuides/actions';
import * as studyGuidesSelect from '../../studyGuides/selectors';
import NudgeStudyTools from './';
import arrow from './assets/arrow.svg';
import { NudgeArrow, NudgeBackground, NudgeCloseButton,
  NudgeContentWrapper, NudgeWrapper } from './styles';
import * as utils from './utils';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';

describe('NudgeStudyTools', () => {
  let store: Store;
  let dispatch: jest.SpyInstance;
  let services: AppServices & MiddlewareAPI;
  // tslint:disable-next-line:variable-name
  let Component: React.JSX.Element;
  const mockPositions = {
    arrowLeft: 1200,
    arrowTopOffset: 245,
    closeButtonLeft: 1500,
    closeButtonTopOffset: 345,
    contentWrapperLeft: -486,
    contentWrapperTopOffset: 385,
    spotlightHeight: 45,
    spotlightLeftOffset: 1190,
    spotlightTopOffset: 190,
    spotlightWidth: 300,
  };

  beforeEach(() => {
    jest.restoreAllMocks();

    store = createTestStore();
    dispatch = jest.spyOn(store, 'dispatch');
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    Component = <Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>;
  });

  it('sets cookies, opens nudge and track opening for books without SG', () => {
    jest.spyOn(utils, 'shouldDisplayNudgeStudyTools')
      .mockReturnValue(true);
    const spySetCookies = jest.spyOn(utils, 'setNudgeStudyToolsCookies');
    const spyTrack = jest.spyOn(services.analytics.openNudgeStudyTools, 'track');

    renderer.create(Component);

    runHooks(renderer);

    expect(spySetCookies).toHaveBeenCalled();
    expect(spyTrack).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(openNudgeStudyTools());
  });

  it('sets cookies, opens nudge and track opening for books with SG', () => {
    jest.spyOn(utils, 'shouldDisplayNudgeStudyTools')
      .mockReturnValue(true);
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));
    store.dispatch(receiveStudyGuidesTotalCounts({
      [uuid()]: {
        [HighlightColorEnum.Yellow]: 1,
      },
    }));
    const spySetCookies = jest.spyOn(utils, 'setNudgeStudyToolsCookies');
    const spyTrack = jest.spyOn(services.analytics.openNudgeStudyTools, 'track');

    renderer.create(Component);

    runHooks(renderer);

    expect(spySetCookies).toHaveBeenCalled();
    expect(spyTrack).toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith(openNudgeStudyTools());
  });

  it('does not render if not open', () => {
    const component = renderer.create(Component);

    expect(() => component.root.findByType(NudgeWrapper)).toThrow();
  });

  it('does not render if open but without positions', () => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    const component = renderer.create(Component);

    expect(() => component.root.findByType(NudgeWrapper)).toThrow();
  });

  it('renders only if open and if positions have been calculated', () => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    jest.spyOn(utils, 'usePositions')
      .mockReturnValue(mockPositions);

    const component = renderer.create(Component);

    expect(() => component.root.findByType(NudgeArrow)).not.toThrow();
    expect(() => component.root.findByType(NudgeCloseButton)).not.toThrow();
    expect(() => component.root.findByType(NudgeContentWrapper)).not.toThrow();
    expect(() => component.root.findByType(NudgeBackground)).not.toThrow();

    const findByTestId = makeFindByTestId(component.root);

    expect(() => findByTestId('nudge-with-sg')).toThrow();
    expect(() => findByTestId('nudge-only-hl')).not.toThrow();
    expect(() => findByTestId('nudge-text-only-hl')).not.toThrow();

    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(true);

    component.update(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    expect(() => findByTestId('nudge-only-hl')).toThrow();
    expect(() => findByTestId('nudge-with-sg')).not.toThrow();
    expect(() => findByTestId('nudge-text-with-sg')).not.toThrow();
  });

  it('Restricts tab navigation', () => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);
    jest.spyOn(reactUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(false);

    jest.spyOn(utils, 'usePositions')
      .mockReturnValue(mockPositions);
    const contentWrapperElement = assertDocument().createElement('div');
    const spyFocus = jest.spyOn(contentWrapperElement, 'focus');
    const createNodeMock = () => contentWrapperElement;

    const component = renderer.create(
      <Provider store={store}>
        <Services.Provider value={services}>
          <MessageProvider>
            <NudgeStudyTools/>
          </MessageProvider>
        </Services.Provider>
      </Provider>,
      { createNodeMock }
    );

    runHooks(renderer);

    // Other keys don't trigger focus
    renderer.act(() => {
      assertDocument().body.dispatchEvent(new KeyboardEvent('keydown', {key: 'a'}));
    });

    expect(spyFocus).toHaveBeenCalledTimes(1);

    // Tab does
    renderer.act(() => {
      assertDocument().body.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab'}));
    });

    expect(spyFocus).toHaveBeenCalledTimes(2);

    // Shift-Tab does
    renderer.act(() => {
      assertDocument().body.dispatchEvent(new KeyboardEvent('keydown', {key: 'Tab', shiftKey: true}));
    });

    expect(spyFocus).toHaveBeenCalledTimes(3);

    // Catch Arrow Keys
    renderer.act(() => {
      assertDocument().body.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
    });

    // Force useEffect to remove listener
    component.update(
      <Provider store={store}>
        <Services.Provider value={services}>
        </Services.Provider>
      </Provider>
    );

    component.update(Component);
  });

  it('dispatches action on clicking close button and tests if body has overflow style set to hidden', () => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    jest.spyOn(reactUtils, 'useMatchMobileMediumQuery')
      .mockReturnValue(true);

    jest.spyOn(utils, 'usePositions')
      .mockReturnValue(mockPositions);

    const component = renderer.create(Component);

    renderer.act(() => {
      expect(assertDocument().body.style.overflow).toEqual('hidden');
    });

    renderer.act(() => {
      const nudgeArrow = component.root.findByType(NudgeArrow);
      expect(nudgeArrow.props.src).toEqual(arrow);
      const button = component.root.findByType(NudgeCloseButton);
      button.props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeNudgeStudyTools());
  });

  it('sets focus to the content wrapper div', () => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    jest.spyOn(utils, 'usePositions')
      .mockReturnValue(mockPositions);

    const contentWrapperElement = assertDocument().createElement('div');
    const spyFocus = jest.spyOn(contentWrapperElement, 'focus');
    const createNodeMock = () => contentWrapperElement;

    renderer.create(Component, { createNodeMock });

    runHooks(renderer);

    expect(spyFocus).toHaveBeenCalledTimes(1);
  });

  it('sets overflow hidden for body element and resets it', () => {
    jest.spyOn(contentSelect, 'showNudgeStudyTools')
      .mockReturnValue(true);

    jest.spyOn(utils, 'usePositions')
      .mockReturnValueOnce(mockPositions)
      .mockReturnValue(null);

    const component = renderer.create(Component);

    runHooks(renderer);

    expect(() => component.root.findByType(NudgeArrow)).not.toThrow();

    expect(assertDocument().body.style.overflow).toEqual('hidden');

    // Callind component.update and then renderer.act triggers hooks to be recalcualted
    component.update(<Provider store={store}>
      <Services.Provider value={services}>
        <MessageProvider>
          <NudgeStudyTools/>
        </MessageProvider>
      </Services.Provider>
    </Provider>);

    runHooks(renderer);

    expect(assertDocument().body.style.overflow).toEqual('');
  });

  it('closes when StudyGuides are opened ', () => {
    store.dispatch(openNudgeStudyTools());

    jest.spyOn(utils, 'usePositions').mockReturnValue(mockPositions);

    const component = renderer.create(Component);

    expect(() => component.root.findByType(NudgeContentWrapper)).not.toThrow();

    renderer.act(() => {
      store.dispatch(openStudyGuides());
    });

    expect(() => component.root.findByType(NudgeContentWrapper)).toThrow();
  });

  it('closes when MyHighlights are opened ', () => {
    store.dispatch(openNudgeStudyTools());

    jest.spyOn(utils, 'usePositions').mockReturnValue(mockPositions);

    const component = renderer.create(Component);

    expect(() => component.root.findByType(NudgeContentWrapper)).not.toThrow();

    renderer.act(() => {
      store.dispatch(openMyHighlights());
    });

    expect(() => component.root.findByType(NudgeContentWrapper)).toThrow();
  });

  it('closes on esc', () => {
    store.dispatch(openNudgeStudyTools());

    jest.spyOn(utils, 'usePositions').mockReturnValue(mockPositions);
    const onKeySpy = jest.spyOn(reactUtils, 'onKey');

    const component = renderer.create(Component);

    expect(() => component.root.findByType(NudgeContentWrapper)).not.toThrow();

    renderer.act(() => {
      onKeySpy.mock.calls[0][2]();
    });

    runHooks(renderer);

    expect(() => component.root.findByType(NudgeContentWrapper)).toThrow();
    onKeySpy.mockClear();
  });
});
