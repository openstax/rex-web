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

  it('selects hamburger menu as nudge study tools target if isMobile prop is passed', () => {
    target.remove();
    const hamburgerMenu = assertDocument().createElement('div');
    hamburgerMenu.setAttribute('id', constants.mobileNudgeStudyToolsTargetId);
    assertDocument().body.appendChild(hamburgerMenu);
    const component = renderer.create(<Provider store={store}>
      <Component isMobile={true} />
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

  it('returns different positions depending on isMobile', () => {
    // Default values
    expect(utils.getPositions(target, false)).toMatchSnapshot(`
    Object {
      "arrowLeft": 1082,
      "arrowTopOffset": 244,
      "closeButtonLeft": 1949,
      "closeButtonTopOffset": 319,
      "contentWrapperLeft": 1243,
      "contentWrapperTopOffset": 375,
      "spotlightHeight": 25,
      "spotlightLeftOffset": 951,
      "spotlightTopOffset": 203,
      "spotlightWidth": 282,
    }
  `);

    // Add additional padding to the spotlight when isMobile prop is passed
    expect(utils.getPositions(target, true)).toMatchInlineSnapshot(`
    Object {
      "arrowLeft": 1082,
      "arrowTopOffset": 244,
      "closeButtonLeft": 1955,
      "closeButtonTopOffset": 319,
      "contentWrapperLeft": 1249,
      "contentWrapperTopOffset": 375,
      "spotlightHeight": 25,
      "spotlightLeftOffset": 945,
      "spotlightTopOffset": 203,
      "spotlightWidth": 294,
    }
  `);
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
