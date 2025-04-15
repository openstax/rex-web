import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import createMockHighlight from '../../../../test/mocks/highlight';
import { assertDocument } from '../../../utils';
import { generateUpdatePayload, getHighlightTopOffset, editCardVisibilityHandler } from './cardUtils';

describe('cardUtils', () => {
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

describe('editCardVisibilityHandler', () => {
  const highlights = [
    {id: 'highlight1', annotation: 'annotation1'},
    {id: 'highlight2', annotation: 'annotation2'},
    {id: 'highlight3', annotation: 'annotation3'},
  ];
  const state = new Map(highlights.map((highlight) => [highlight.id, false]));

  it('hide highlight', () => {
    const result = editCardVisibilityHandler(state, { type: 'HIDE', id: 'highlight1'});
    expect(result.get('highlight1')).toBe(true);
    expect(result.get('highlight2')).toBe(false);
    expect(result.get('highlight3')).toBe(false);
  });

  it('hide highlight - unknown id', () => {
    const result = editCardVisibilityHandler(state, { type: 'HIDE'});
    expect(result.get('highlight1')).toBe(false);
  });

  it('show highlight', () => {
    const result = editCardVisibilityHandler(state, { type: 'SHOW', id: 'highlight1'});
    expect(result.get('highlight1')).toBe(false);
    expect(result.get('highlight2')).toBe(false);
    expect(result.get('highlight3')).toBe(false);
  });

  it('show highlight - unknown id', () => {
    const result = editCardVisibilityHandler(state, { type: 'SHOW'});
    expect(result.get('highlight1')).toBe(false);
  });

  it('show all highlights', () => {
    const firstResult = editCardVisibilityHandler(state, { type: 'HIDE', id: 'highlight1'});
    expect(firstResult.get('highlight1')).toBe(true);
    const secondResult = editCardVisibilityHandler(state, { type: 'SHOW_ALL'});
    expect(secondResult.get('highlight1')).toBe(false);
    expect(secondResult.get('highlight2')).toBe(false);
    expect(secondResult.get('highlight3')).toBe(false);
  });

  it('return state when action type does not exist', () => {
    const result = editCardVisibilityHandler(state, { type: 'SHOW_ANY'});
    expect(result.get('highlight1')).toBe(false);
  });
});
