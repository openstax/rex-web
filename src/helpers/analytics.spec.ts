import { Document } from '@openstax/types/lib.dom';
import { assertWindow } from '../app/utils';
import createTestStore from '../test/createTestStore';
import analytics, { registerGlobalAnalytics } from './analytics';

const makeEvent = (doc: Document) => {
  const event = doc.createEvent('MouseEvents');
  event.initEvent('click', true, false);
  return event;
};

describe('registerGlobalAnalytics', () => {
  const window = assertWindow();
  const document = window.document;
  const store = createTestStore();
  let clickLink: jest.SpyInstance;
  let clickButton: jest.SpyInstance;
  let clickInput: jest.SpyInstance;
  let print: jest.SpyInstance;
  let unload: jest.SpyInstance;
  const addListener = jest.fn();
  const matchMedia = (window as any).matchMedia = jest.fn();

  matchMedia.mockReturnValue({addListener});

  registerGlobalAnalytics(window, store);

  beforeEach(() => {
    clickLink = jest.spyOn(analytics.clickLink, 'track');
    clickButton = jest.spyOn(analytics.clickButton, 'track');
    clickInput = jest.spyOn(analytics.clickInput, 'track');
    print = jest.spyOn(analytics.print, 'track');
    unload = jest.spyOn(analytics.unload, 'track');

    clickLink.mockClear();
    clickButton.mockClear();
    clickInput.mockClear();
    print.mockClear();
  });

  it('reports anchor clicks', () => {
    const anchor = document.createElement('a');
    document.body.append(anchor);
    anchor.dispatchEvent(makeEvent(document));

    expect(clickLink).toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
  });

  it('reports button clicks or skips if requested', () => {
    const button = document.createElement('button');
    document.body.append(button);
    button.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).toHaveBeenCalled();
  });

  it('Skips reporting button clicks if requested', () => {
    const button = document.createElement('button');
    button.setAttribute('data-analytics-disable-track', 'true');
    document.body.append(button);
    button.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
  });

  it('reports unload', () => {
    const event = document.createEvent('Event');
    event.initEvent('beforeunload', true, false);

    document.dispatchEvent(event);

    expect(unload).toHaveBeenCalled();
  });

  it('noops on unknown click target', () => {
    const event = makeEvent(document);

    Object.defineProperty(event, 'target', {
      value: undefined,
    });

    document.dispatchEvent(event);

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
  });

  it('tracks print', () => {
    expect(addListener).toHaveBeenCalledTimes(1);
    addListener.mock.calls[0][0]({matches: true});
    expect(print).toHaveBeenCalled();
  });

  it('doesn\'t track print on other media changes', () => {
    expect(addListener).toHaveBeenCalledTimes(1);
    addListener.mock.calls[0][0]({matches: false});
    expect(print).not.toHaveBeenCalled();
  });

  it('reports input click for type button', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'button');
    document.body.append(input);
    input.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
    expect(clickInput).toHaveBeenCalled();
  });

  it('reports input click for type submit', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'submit');
    document.body.append(input);
    input.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
    expect(clickInput).toHaveBeenCalled();
  });

  it('reports input click for type button', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'button');
    document.body.append(input);
    input.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
    expect(clickInput).toHaveBeenCalled();
  });

  it('noops for input with different type than button or submit', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    document.body.append(input);
    input.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
    expect(clickInput).not.toHaveBeenCalled();
  });

  it('Skips reporting input clicks if requested', () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'button');
    input.setAttribute('data-analytics-disable-track', 'true');
    document.body.append(input);
    input.dispatchEvent(makeEvent(document));

    expect(clickLink).not.toHaveBeenCalled();
    expect(clickButton).not.toHaveBeenCalled();
    expect(clickInput).not.toHaveBeenCalled();
  });
});
