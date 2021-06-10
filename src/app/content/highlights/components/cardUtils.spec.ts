import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createMockHighlight from '../../../../test/mocks/highlight';
import { assertDocument } from '../../../utils';
import {
  generateUpdatePayload,
  getHighlightOffset,
  getHighlightTopOffset,
  updateStackedCardsPositions,
} from './cardUtils';

describe('cardUtils', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('getHighlightOffset', () => {
    it('returns offset for highlight', () => {
      expect(getHighlightOffset(
        assertDocument().createElement('div'),
        createMockHighlight() as any as Highlight)
      ).toEqual({ top: 0, bottom: 0 });
    });

    it('returns offset to hide higlight if it is inside collapsed ancestor', () => {
      const highlight = createMockHighlight('asd');
      const element = assertDocument().createElement('span');
      highlight.elements = [element];
      const ancestor = assertDocument().createElement('div');
      jest.spyOn(element, 'closest').mockImplementationOnce(() => ancestor);
      jest.spyOn(element, 'getBoundingClientRect').mockReturnValueOnce({ top: 200 } as any);
      jest.spyOn(ancestor, 'getBoundingClientRect').mockReturnValueOnce({ bottom: 100 } as any);
      expect(getHighlightOffset(
        assertDocument().createElement('div'),
        highlight as any as Highlight)
      ).toEqual({ top: -9999, bottom: -9999 });
    });
  });

  describe('getHighlightTopOffset', () => {
    it('returns undefined if passed container is undefined', () => {
      expect(getHighlightTopOffset(undefined, { id: 'asd' } as Highlight)).toBeUndefined();
    });

    it('returns top offset for a highlight', () => {
      expect(getHighlightTopOffset(
        assertDocument().createElement('div'),
        createMockHighlight() as any as Highlight)
      ).toEqual(0);
    });
  });

  describe('generateUpdatePayload', () => {
    const highlightId = 'my-id';
    const oldData = {
      annotation: 'my annotation',
      color: HighlightColorEnum.Blue,
    };

    it('handles updating both fields', () => {
      const update = { color: HighlightColorEnum.Green, annotation: 'hello' };
      const payload = generateUpdatePayload(oldData, { id: highlightId, ...update });

      expect(payload.preUpdateData.highlight).toEqual(oldData);
      expect(payload.updatePayload.highlight).toEqual(update);
    });

    it('handles updating only color', () => {
      const update = { color: HighlightColorEnum.Green };
      const payload = generateUpdatePayload(oldData, { id: highlightId, ...update });

      expect(payload.preUpdateData.highlight).toEqual(oldData);
      expect(payload.updatePayload.highlight).toEqual({ ...update, annotation: oldData.annotation });
    });

    it('handles updating only annotation', () => {
      const update = { annotation: 'hi' };
      const payload = generateUpdatePayload(oldData, { id: highlightId, ...update });

      expect(payload.preUpdateData.highlight).toEqual(oldData);
      expect(payload.updatePayload.highlight).toEqual({ ...update, color: oldData.color });
    });
  });

  describe('updateStackedCardsPositions', () => {
    it('returns hidden higlight position without adjusting the offset', () => {
      const highlight = createMockHighlight('asd');
      const mockGetHighlightPosition = jest.fn().mockReturnValueOnce({ top: -9999 });
      const mockPosition = new Map<string, number>();
      mockPosition.set(highlight.id, -9999);
      expect(updateStackedCardsPositions(
        [highlight as any as Highlight],
        {[`${highlight.id}`]: 20 } as any,
        mockGetHighlightPosition
      )).toEqual(mockPosition);
    });
  });
});
