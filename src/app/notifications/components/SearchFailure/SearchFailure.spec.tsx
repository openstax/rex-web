import React from 'react';
import ReactTestUtils from 'react-dom/test-utils';
import renderer from 'react-test-renderer';
import SearchFailure, { shouldAutoDismissAfter } from '.';
import { renderToDom } from '../../../../test/reactutils';
import MessageProvider from '../../../MessageProvider';
import { assertWindow } from '../../../utils';
import { clearErrorAfter, fadeOutDuration } from './styles';
import { resetModules } from '../../../../test/utils';


jest.mock('react', () => {
  const react = (jest as any).requireActual('react');
  return { ...react, useEffect: react.useLayoutEffect };
});

describe('SearchFailure', () => {
  let addEventListener: jest.SpyInstance;
  let setTimeout: jest.SpyInstance;
  let clearTimeout: jest.SpyInstance;
  let window: Window;
  let removeEventListener: jest.SpyInstance;

  beforeEach(() => {
    window = assertWindow();
    addEventListener = jest.spyOn(window, 'addEventListener');
    removeEventListener = jest.spyOn(window, 'removeEventListener');
    setTimeout = jest.spyOn(window, 'setTimeout');
    clearTimeout = jest.spyOn(window, 'clearTimeout');
  });

  it.only('dissapears after set time', async() => {
    const dismiss = jest.fn(() => undefined);

    const component = renderer.create(<MessageProvider><SearchFailure dismiss={dismiss} /></MessageProvider>);

    expect(addEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(addEventListener).toHaveBeenCalledWith('click', expect.anything());

    await renderer.act(() => {
      return new Promise(((resolve) => window.setTimeout(resolve, clearErrorAfter + fadeOutDuration)));
    });

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());
    expect(dismiss).toHaveBeenCalled();

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

    component.root.findByType('button').props.onClick();

    expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.anything());
    expect(removeEventListener).toHaveBeenCalledWith('click', expect.anything());

    expect(dismiss).toHaveBeenCalled();

    component.unmount();
  });
});
