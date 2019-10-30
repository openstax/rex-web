import scrollTo from 'scroll-to-element';
import { scrollIntoView } from './domUtils';
import { assertDocument, assertWindow } from './utils';

jest.mock('scroll-to-element');

beforeEach(() => {
  jest.resetAllMocks();
});

describe('scrollIntoView', () => {
  it('scrolls up', () => {
    const element = assertDocument().createElement('div');
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: -40,
      top: -50,
    } as any);

    scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('scrolls down', () => {
    const element = assertDocument().createElement('div');
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: assertWindow().innerHeight + 60,
      top: assertWindow().innerHeight + 50,
    } as any);

    scrollIntoView(element);

    expect(scrollTo).toHaveBeenCalledWith(element, expect.anything());
  });

  it('noops', () => {
    const element = assertDocument().createElement('div');
    jest.spyOn(element, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      top: 0,
    } as any);

    scrollIntoView(element);

    expect(scrollTo).not.toHaveBeenCalledWith(element, expect.anything());
  });
});
