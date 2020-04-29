import Highlighter, { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { assertDocument } from '../../../utils';
import { HighlightData } from '../../highlights/types';
import * as utils from './highlightUtils';

describe('updateStyle', () => {
  let highlighter: Highlighter;
  let updateStyle: ReturnType<typeof utils.updateStyle>;

  beforeEach(() => {
    highlighter = new Highlighter(assertDocument().createElement('div'));
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
});
