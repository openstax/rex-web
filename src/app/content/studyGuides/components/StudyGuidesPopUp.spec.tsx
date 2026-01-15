import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer, { act } from 'react-test-renderer';
import createTestServices from '../../../../test/createTestServices';
import createTestStore from '../../../../test/createTestStore';
import { book as archiveBook, page } from '../../../../test/mocks/archiveLoader';
import { mockCmsBook } from '../../../../test/mocks/osWebLoader';
import { dispatchKeyDownEvent, renderToDom } from '../../../../test/reactutils';
import TestContainer from '../../../../test/TestContainer';
import { receiveUser } from '../../../auth/actions';
import { User } from '../../../auth/types';
import OnEsc from '../../../components/OnEsc';
import { receiveFeatureFlags } from '../../../featureFlags/actions';
import { MiddlewareAPI, Store } from '../../../types';
import * as utils from '../../../utils';
import { assertNotNull } from '../../../utils';
import { receiveBook, receivePage } from '../../actions';
import { studyGuidesFeatureFlag } from '../../constants';
import { formatBookData } from '../../utils';
import { closeStudyGuides, openStudyGuides } from '../actions';
import StudyguidesPopUp from './StudyGuidesPopUp';

const book = formatBookData(archiveBook, mockCmsBook);

// this is a hack because useEffect is currently not called
// when using jsdom? https://github.com/facebook/react/issues/14050
// seems to work better in react-test-renderer but
// i need the ref here
jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: any) => children,
}));

describe('Study Guides button and PopUp', () => {
  let dispatch: jest.SpyInstance;
  let store: Store;
  let user: User;
  let services: ReturnType<typeof createTestServices> & MiddlewareAPI;

  beforeEach(() => {
    store = createTestStore();
    services = {
      ...createTestServices(),
      dispatch: store.dispatch,
      getState: store.getState,
    };
    user = {firstName: 'test', isNotGdprLocation: true, lastName: 'test', uuid: 'some_uuid'};

    // book, page, and enabled FF needed for modal to open.
    store.dispatch(receiveBook(book));
    store.dispatch(receivePage({...page, references: []}));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    dispatch = jest.spyOn(store, 'dispatch');
  });

  it('closes pop up with close button', async() => {
    const component = renderer.create(<TestContainer services={services} store={store}>
      <StudyguidesPopUp />
    </TestContainer>);

    act(() => { store.dispatch(openStudyGuides()); });
    act(() => {
      component.root.findByProps({ 'data-testid': 'close-studyguides-popup' })
      .props.onClick();
    });

    expect(dispatch).toHaveBeenCalledWith(closeStudyGuides());
  });

  it('closes popup on esc and tracks analytics', async() => {
    store.dispatch(openStudyGuides());
    store.dispatch(receiveUser(user));
    store.dispatch(receiveFeatureFlags([studyGuidesFeatureFlag]));

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <OnEsc />
      <StudyguidesPopUp />
    </TestContainer>);

    const track = jest.spyOn(services.analytics.closeStudyGuides, 'track');
    const element: HTMLElement = assertNotNull(node.querySelector('[data-testid=\'studyguides-popup-wrapper\']'), '');

    dispatchKeyDownEvent({element, key: 'Escape'});

    expect(track).toHaveBeenCalled();

  });

  it('closes popup on overlay click and tracks analytics', async() => {
    const window = utils.assertWindow();
    store.dispatch(openStudyGuides());
    store.dispatch(receiveUser(user));

    const { node } = renderToDom(<TestContainer services={services} store={store}>
      <StudyguidesPopUp />
    </TestContainer>);

    const track = jest.spyOn(services.analytics.closeStudyGuides, 'track');
    const element = assertNotNull(node.querySelector('[data-testid=\'scroll-lock-overlay\']'), '');

    const event = window.document.createEvent('MouseEvents');
    event.initEvent('click', true, true);
    const preventDefault = event.preventDefault = jest.fn();

    element.dispatchEvent(event); // this checks for bindings using addEventListener
    ReactTestUtils.Simulate.click(element, {preventDefault}); // this checks for react onClick prop

    expect(track).toHaveBeenCalled();

  });

  it('focuses close button when modal opens', () => {
    const document = utils.assertDocument();
    const closeButton = document.createElement('button');
    closeButton.setAttribute('data-testid', 'close-studyguides-popup');
    const closeButtonFocus = jest.fn();
    closeButton.focus = closeButtonFocus;
    document.body.appendChild(closeButton);

    const mockButton = document.createElement('button');
    mockButton.focus();

    const component = renderer.create(<TestContainer services={services} store={store}>
      <StudyguidesPopUp />
    </TestContainer>);

    act(() => { store.dispatch(openStudyGuides()); });

    expect(closeButtonFocus).toHaveBeenCalled();

    closeButton.remove();
  });

  it('restores focus to opening button when modal closes', () => {
    const document = utils.assertDocument();
    const closeButton = document.createElement('button');
    closeButton.setAttribute('data-testid', 'close-studyguides-popup');
    document.body.appendChild(closeButton);

    const mockButton = document.createElement('button');
    const mockButtonFocus = jest.fn();
    mockButton.focus = mockButtonFocus;
    document.body.appendChild(mockButton);
    mockButton.focus();

    const component = renderer.create(<TestContainer services={services} store={store}>
      <StudyguidesPopUp />
    </TestContainer>);

    act(() => { store.dispatch(openStudyGuides()); });
    act(() => { store.dispatch(closeStudyGuides()); });

    expect(mockButtonFocus).toHaveBeenCalledTimes(2);

    closeButton.remove();
    mockButton.remove();
  });
});
