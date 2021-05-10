import Highlighter, { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createMockHighlight from '../../../../test/mocks/highlight';
import { assertDocument } from '../../../utils';
import { HighlightData } from '../../highlights/types';
import * as utils from './highlightUtils';

describe('updateStyle', () => {
  let highlighter: Highlighter;
  let updateStyle: ReturnType<typeof utils.updateStyle>;

  beforeEach(() => {
    highlighter = new Highlighter(assertDocument().createElement('div'), { formatMessage: jest.fn() });
    updateStyle = utils.updateStyle(highlighter);
  });

  it('fetches the highlight object and sets its style', () => {
    const getHighlight = jest.spyOn(highlighter, 'getHighlight');
    const setStyle = jest.fn();

    getHighlight.mockReturnValue({setStyle} as any as Highlight);

    updateStyle({id: 'coolid', color: 'red' as HighlightColorEnum} as HighlightData);

    expect(getHighlight).toHaveBeenCalledWith('coolid');
    expect(setStyle).toHaveBeenCalledWith('red');
  });

  it('noops if the highlgiht isn\'t found', () => {
    const getHighlight = jest.spyOn(highlighter, 'getHighlight');
    const setStyle = jest.fn();

    getHighlight.mockReturnValue(undefined);

    updateStyle({id: 'coolid', color: 'red' as HighlightColorEnum} as HighlightData);

    expect(getHighlight).toHaveBeenCalledWith('coolid');
    expect(setStyle).not.toHaveBeenCalled();
  });

  it('inserts pending highlight in correct order', async() => {
    const mockHighlight1 = createMockHighlight('id1') as any as Highlight;
    const pendingHighlight = createMockHighlight('pending') as any as Highlight;
    const mockHighlight2 = createMockHighlight('id2') as any as Highlight;

    jest.spyOn(highlighter, 'getHighlightBefore')
      .mockReturnValueOnce(mockHighlight1)
      .mockReturnValueOnce(mockHighlight1)
      .mockReturnValueOnce(undefined)
    ;

    const highlights = [mockHighlight1, mockHighlight2];

    expect(utils.insertPendingCardInOrder(highlighter, highlights, pendingHighlight))
      .toEqual([mockHighlight1, pendingHighlight, mockHighlight2]);

    expect(utils.insertPendingCardInOrder(highlighter, [...highlights, pendingHighlight], pendingHighlight))
      .toEqual([mockHighlight1, pendingHighlight, mockHighlight2]);

    expect(utils.insertPendingCardInOrder(highlighter, highlights, pendingHighlight))
      .toEqual([pendingHighlight, mockHighlight1, mockHighlight2]);
  });
});
