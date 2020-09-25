import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { generateUpdatePayload, getHighlightTopOffset } from './cardUtils';

describe('cardUtils', () => {
  it('returns undefined if passed container is undefined', () => {
    expect(getHighlightTopOffset(undefined, { id: 'asd' } as Highlight)).toBeUndefined();
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
