import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import SearchFailure, { shouldAutoDismissAfter } from '.';
import { renderToDom } from '../../../../test/reactutils';
import { resetModules } from '../../../../test/utils';
import MessageProvider from '../../../MessageProvider';
import { assertDocument, assertWindow } from '../../../utils';
import { clearErrorAfter } from './styles';

jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('SearchFailure', () => {
  let addEventListener: jest.SpyInstance;
  let window: Window;
  let removeEventListener: jest.SpyInstance;

  beforeEach(() => {
    resetModules();
    window = assertWindow();
    addEventListener = jest.spyOn(window, 'addEventListener');
    removeEventListener = jest.spyOn(window, 'removeEventListener');

    jest.useFakeTimers();
  });

  it('manages timeouts', async() => {
    const dismiss = jest.fn(() => undefined);

    const component = renderer.create(<MessageProvider><SearchFailure dismiss={dismiss} /></MessageProvider>);

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(addEventListener).toHaveBeenCalledWith('click', expect.anything());

    expect(setTimeout).toHaveBeenCalledWith(expect.anything(), clearErrorAfter);
    expect(setTimeout).toHaveBeenCalledWith(expect.anything(), shouldAutoDismissAfter);

    renderer.act(() => {
      jest.runAllTimers();
    });

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());

    const bannerBody = component.root.findByProps({'data-testid': 'banner-body'});

    expect(bannerBody.props.isFadingOut).toBe(true);

    component.unmount();
  });

  it('doesnt allow dismissing immediately after mounting', () => {
    const dismiss = jest.fn(() => undefined);

    const component = renderer.create(<MessageProvider><SearchFailure dismiss={dismiss} /></MessageProvider>);

    const bannerBody = component.root.findByProps({'data-testid': 'banner-body'});

    renderer.act(() => {
      const event = assertDocument().createEvent('MouseEvent');
      event.initEvent('click');
      assertWindow().dispatchEvent(event);
    });

    expect(bannerBody.props.isFadingOut).toBe(false);
    component.unmount();
  });

  it('dismisses on animation end', () => {
    const dismiss = jest.fn(() => undefined);

    const {root} = renderToDom(<MessageProvider><SearchFailure dismiss={dismiss} /></MessageProvider>);
    const wrapper = root.querySelector('[data-testid=banner-body]');

    if (!wrapper) {
      return expect(wrapper).toBeTruthy();
    }

    ReactTestUtils.Simulate.animationEnd(wrapper);

    expect(dismiss).toHaveBeenCalled();
  });

  it('dismisses notification on click', () => {
    const dismiss = jest.fn(() => undefined);
    const component = renderer.create(<MessageProvider><SearchFailure dismiss={dismiss} /></MessageProvider>);

    renderer.act(() => {
      jest.advanceTimersByTime(shouldAutoDismissAfter);
    });

    const bannerBody = component.root.findByProps({'data-testid': 'banner-body'});

    renderer.act(() => {
      const event = assertDocument().createEvent('MouseEvent');
      event.initEvent('click');
      assertWindow().dispatchEvent(event);
    });

    expect(bannerBody.props.isFadingOut).toBe(true);

    component.unmount();
  });
});
