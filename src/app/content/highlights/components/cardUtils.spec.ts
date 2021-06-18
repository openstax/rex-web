import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createMockHighlight from '../../../../test/mocks/highlight';
import { assertDocument } from '../../../utils';
import {
  generateUpdatePayload,
  getHighlightOffset,
  getHighlightTopOffset,
  hiddenHighlightOffset,
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
      ancestor.dataset.type = 'solution';
      ancestor.setAttribute('aria-expanded', 'false');
      jest.spyOn(element, 'closest').mockImplementationOnce(() => ancestor);
      expect(getHighlightOffset(
        assertDocument().createElement('div'),
        highlight as any as Highlight)
      ).toEqual({ top: hiddenHighlightOffset, bottom: hiddenHighlightOffset });
    });
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
    const update = {color: HighlightColorEnum.Green, annotation: 'hello'};
    const payload = generateUpdatePayload(oldData, {id: highlightId, ...update});

    expect(payload.preUpdateData.highlight).toEqual(oldData);
    expect(payload.updatePayload.highlight).toEqual(update);
  });

  it('handles updating only color', () => {
    const update = {color: HighlightColorEnum.Green};
    const payload = generateUpdatePayload(oldData, {id: highlightId, ...update});

    expect(payload.preUpdateData.highlight).toEqual(oldData);
    expect(payload.updatePayload.highlight).toEqual({...update, annotation: oldData.annotation});
  });

  it('handles updating only annotation', () => {
    const update = {annotation: 'hi'};
    const payload = generateUpdatePayload(oldData, {id: highlightId, ...update});

    expect(payload.preUpdateData.highlight).toEqual(oldData);
    expect(payload.updatePayload.highlight).toEqual({...update, color: oldData.color});
  });
});
