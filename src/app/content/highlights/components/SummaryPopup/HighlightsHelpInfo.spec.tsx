import { MediaQueryList } from '@openstax/types/lib.dom';
import * as Cookies from 'js-cookie';
import React from 'react';
import renderer from 'react-test-renderer';
import { PlainButton } from '../../../../components/Button';
import MessageProvider from '../../../../MessageProvider';
import HighlightsHelpInfo, { cookieId, timeBeforeShow } from './HighlightsHelpInfo';

jest.mock('js-cookie', () => ({
  ...jest.requireActual('js-cookie'),
  get: jest.fn(),
  set: jest.fn(),
}));

describe('HighlightsHelpInfo', () => {
  jest.useFakeTimers();

  it('matches snapshot when hidden', () => {
    const component = renderer.create(<MessageProvider>
      <HighlightsHelpInfo/>
    </MessageProvider>);

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('matches snapshot when showed', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;

    const component = renderer.create(<MessageProvider>
      <HighlightsHelpInfo/>
    </MessageProvider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(component.toJSON()).toMatchSnapshot();
  });

  it('does not open if we are not on mobile', async() => {
    window!.matchMedia = () => ({matches: false}) as MediaQueryList;

    const component = renderer.create(<MessageProvider>
      <HighlightsHelpInfo/>
    </MessageProvider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(() => component.root.findByProps({ 'data-testid': 'support-link' })).toThrow();
  });

  it('does not open if cookie is already set', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;

    const spy = jest.spyOn(Cookies, 'get');
    spy.mockImplementationOnce(() => 'true' as any);

    const component = renderer.create(<MessageProvider>
      <HighlightsHelpInfo/>
    </MessageProvider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    expect(() => component.root.findByProps({ 'data-testid': 'support-link' })).toThrow();
  });

  it('set cookie on dismiss', async() => {
    window!.matchMedia = () => ({matches: true}) as MediaQueryList;

    const component = renderer.create(<MessageProvider>
      <HighlightsHelpInfo/>
    </MessageProvider>);

    await renderer.act(async() => {
      jest.runTimersToTime(timeBeforeShow);
    });

    await renderer.act(async() => {
      const dismissButton = component.root.findByType(PlainButton);
      dismissButton.props.onClick();
    });

    expect(Cookies.set).toHaveBeenCalledWith(cookieId, 'true');
  });
});
