import { DOMRect, HTMLElement } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import { Provider } from 'react-redux';
import renderer from 'react-test-renderer';
import createTestStore from '../../../../test/createTestStore';
import { shortPage } from '../../../../test/mocks/archiveLoader';
import { Store } from '../../../types';
import { assertDocument, assertWindow } from '../../../utils';
import { receivePage } from '../../actions';
import * as studyGuidesSelect from '../../studyGuides/selectors';
import * as constants from './constants';
import * as utils from './utils';

describe('usePositions', () => {
  let target: HTMLElement;
  let store: Store;
  // tslint:disable-next-line: variable-name
  let Component: (props: { isMobile: boolean }) => JSX.Element;
  const mockRect = { bottom: 228, height: 25, left: 951, right: 1233, top: 203, width: 282 } as any as DOMRect;

  beforeEach(() => {
    const document = assertDocument();
    target = document.createElement('div');
    target.setAttribute('id', constants.nudgeStudyToolsTargetId);
    const child = document.createElement('div');
    target.append(child);
    jest.spyOn(child, 'getBoundingClientRect')
      .mockReturnValue(mockRect);
    document.body.appendChild(target);

    store = createTestStore();
    Component = (props) => {
      const positions = utils.usePositions(props.isMobile);
      return <React.Fragment>
        {JSON.stringify(positions)}
      </React.Fragment>;
    };
  });

  afterEach(() => {
    target.remove();
  });

  it('return null if target was not found', () => {
    target.remove();

    const component = renderer.create(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('return positions and updates body overflow to previous value after finishing calculations', () => {
    jest.spyOn(studyGuidesSelect, 'hasStudyGuides')
      .mockReturnValue(true);

    Object.defineProperty(assertWindow(), 'innerWidth', {
      value: 1900,
    });

    const component = renderer.create(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    renderer.act(() => {
      assertDocument().body.style.overflow = 'scroll';
    });

    component.update(<Provider store={store}>
      <Component isMobile={false} />
    </Provider>);

    expect(component.toJSON()).toMatchSnapshot();

    // Coverage for useEffect return function
    component.unmount();

    renderer.act(() => {
      assertDocument().body.style.overflow = 'scroll';
    });
  });

  it('returns different positions depends on isMobile and windowWidth', () => {
    // Default values
    expect(utils.getPositions(target, false, 1900)).toEqual({
      arrowLeft: 952,
      arrowTopOffset: 248,
      closeButtonLeft: 1253,
      closeButtonTopOffset: 348,
      contentWrapperRight: 657,
      contentWrapperTopOffset: 388,
      spotlightHeight: 45,
      spotlightLeftOffset: 941,
      spotlightTopOffset: 193,
      spotlightWidth: 302,
    });

    // Change of windowWidth affects only contentWrapperRight
    expect(utils.getPositions(target, false, 1200)).toEqual({
      arrowLeft: 952,
      arrowTopOffset: 248,
      closeButtonLeft: 1253,
      closeButtonTopOffset: 348,
      // this is less by 700px (1900 - 1200 = 700)
      contentWrapperRight: -43,
      contentWrapperTopOffset: 388,
      spotlightHeight: 45,
      spotlightLeftOffset: 941,
      spotlightTopOffset: 193,
      spotlightWidth: 302,
    });

    // Values when isMobile prop is passed (since we are not changing windowWidth only some of the values will change)
    expect(utils.getPositions(target, true, 1900)).toEqual({
      arrowLeft: 1050,
      arrowTopOffset: 248,
      closeButtonLeft: 1253,
      // Close button adjusted to contentWrapperTopOffset
      closeButtonTopOffset: 280,
      contentWrapperRight: 657,
      // In mobile arrow is smaller so content is closer to the top
      contentWrapperTopOffset: 320,
      spotlightHeight: 45,
      spotlightLeftOffset: 941,
      spotlightTopOffset: 193,
      spotlightWidth: 302,
    });
  });
});

describe('cookies helpers', () => {
  beforeEach(() => {
    Cookies.remove(constants.cookieNudge.date);
    Cookies.remove(constants.cookieNudge.counter);
    Cookies.remove(constants.cookieNudge.pageCounter);
  });

  it('getCounterCookie gets counter or 0', () => {
    expect(utils.getCounterCookie()).toEqual(0);
    Cookies.set(constants.cookieNudge.counter, '2');
    expect(utils.getCounterCookie()).toEqual(2);
  });

  it('getDateCookie gets date or undefined', () => {
    expect(utils.getDateCookie()).toEqual(undefined);
    const date = new Date();
    Cookies.set(constants.cookieNudge.date, date.toString());
    // date.toString() will remove ms from the date and jest's toEqual will find that as a difference
    // so we comapre with new Date(date.toString())
    expect(utils.getDateCookie()).toEqual(new Date(date.toString()));
  });

  it('getPageCounterCookie gets counter or undefined', () => {
    expect(utils.getPageCounterCookie()).toEqual(0);
    Cookies.set(constants.cookieNudge.pageCounter, '3');
    expect(utils.getPageCounterCookie()).toEqual(3);
  });

  it('passedTimeInterval - return false if did not pass time interval', () => {
    expect(utils.passedTimeInterval()).toEqual(true);
    Cookies.set(constants.cookieNudge.date, new Date().toString());
    expect(utils.passedTimeInterval()).toEqual(false);
  });

  it('passedTimeInterval - return true if passed allowed time interval or last date is undefined', () => {
    expect(utils.passedTimeInterval()).toEqual(true);
    const now = new Date();
    const passed = new Date(now.getTime() - constants.timeIntervalBetweenShowingNudgeInMs - 10000);
    Cookies.set(constants.cookieNudge.date, passed.toString());
    expect(utils.passedTimeInterval()).toEqual(true);
  });

  it('incrementPageCounterCookie increments page counter cookie', () => {
    expect(utils.getPageCounterCookie()).toEqual(0);
    utils.incrementPageCounterCookie();
    utils.incrementPageCounterCookie();
    expect(utils.getPageCounterCookie()).toEqual(2);
  });

  it('shouldDisplayNudgeStudyTools - return true only if all criteria passes', () => {
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(false);

    const now = new Date();
    const passed = new Date(now.getTime() - constants.timeIntervalBetweenShowingNudgeInMs - 10000);
    Cookies.set(constants.cookieNudge.date, passed.toString());
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(false);

    Cookies.set(constants.cookieNudge.pageCounter, constants.nudgeStudyToolsMinPageLimit.toString());
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(true);

    Cookies.set(constants.cookieNudge.counter, constants.nudgeStudyToolsShowLimit.toString());
    expect(utils.shouldDisplayNudgeStudyTools()).toEqual(false);
  });

  it('setNudgeStudyToolsCookies', () => {
    Cookies.set(constants.cookieNudge.pageCounter, '1');
    const counter = utils.getCounterCookie();
    const pageCounter = utils.getPageCounterCookie();
    const date = utils.getDateCookie();
    expect(counter).toEqual(0);
    expect(pageCounter).toEqual(1);
    expect(date).toEqual(undefined);

    utils.setNudgeStudyToolsCookies();

    expect(utils.getCounterCookie()).toEqual(1);
    expect(utils.getPageCounterCookie()).toEqual(0);
    expect(utils.getDateCookie()).toBeTruthy();
  });

  it('useIncrementPageCounter - increments page counter cookie to until it reaches limit', () => {
    const store = createTestStore();
    // tslint:disable-next-line: variable-name
    const Component = () => {
      utils.useIncrementPageCounter();
      return <div/>;
    };

    renderer.create(<Provider store={store}>
      <Component />
    </Provider>);

    expect(utils.getPageCounterCookie()).toEqual(0);
    renderer.act(() => {
      store.dispatch(receivePage({...shortPage, references: []}));
    });

    expect(utils.getPageCounterCookie()).toEqual(1);
    renderer.act(() => {
      store.dispatch(receivePage({...shortPage, references: []}));
    });

    expect(utils.getPageCounterCookie()).toEqual(2);
    renderer.act(() => {
      store.dispatch(receivePage({...shortPage, references: []}));
    });

    expect(utils.getPageCounterCookie()).toEqual(3);
  });
});
