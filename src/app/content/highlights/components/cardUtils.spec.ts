import { Highlight } from '@openstax/highlighter';
import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { Node, Selection } from '@openstax/types/lib.dom';
import createMockHighlight from '../../../../test/mocks/highlight';
import { assertDocument } from '../../../utils';
import {
  generateUpdatePayload,
  getHighlightTopOffset,
  editCardVisibilityHandler,
  getOffsetToAdjustForHighlightPosition,
  getSelectionDirection,
} from './cardUtils';

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

  it('return state when action type does not exist', () => {
    const result = editCardVisibilityHandler(state, { type: 'SHOW_ANY'});
    expect(result.get('highlight1')).toBe(false);
  });
});
describe('getOffsetToAdjustForHighlightPosition', () => {
  const highlight = { id: 'h1' } as any;
  const highlight2 = { id: 'h2' } as any;

  const cardsPositions = new Map<string, number>([
    ['h1', 100],
    ['h2', 200],
  ]);

  const getHighlightPosition = (h: any) => h.id === 'h1'
    ? { top: 40, bottom: 60 }
    : { top: 80, bottom: 120 };

  it('returns 0 for top and 120 for bottom if highlight is undefined', () => {
    expect(getOffsetToAdjustForHighlightPosition(undefined, cardsPositions, getHighlightPosition, false)).toBe(0);
    expect(getOffsetToAdjustForHighlightPosition(undefined, cardsPositions, getHighlightPosition, true)).toBe(120); // return 120 as bottom offset
  });

  it('returns position - top if preferEnd is false', () => {
    expect(
      getOffsetToAdjustForHighlightPosition(highlight, cardsPositions, getHighlightPosition, false)
    ).toBe(100 - 40);
  });

  it('returns position - bottom if preferEnd is true', () => {
    expect(
      getOffsetToAdjustForHighlightPosition(highlight, cardsPositions, getHighlightPosition, true)
    ).toBe(100 + 60);
  });

  it('throws if highlight id not in cardsPositions', () => {
    const missingHighlight = { id: 'missing' } as any;
    expect(() =>
      getOffsetToAdjustForHighlightPosition(missingHighlight, cardsPositions, getHighlightPosition, false)
    ).toThrow(/internal function requested postion of unknown highlight/);
  });

  it('works for a different highlight', () => {
    expect(
      getOffsetToAdjustForHighlightPosition(highlight2, cardsPositions, getHighlightPosition, false)
    ).toBe(200 - 80);
    expect(
      getOffsetToAdjustForHighlightPosition(highlight2, cardsPositions, getHighlightPosition, true)
    ).toBe(200);
  });
});

describe('getSelectionDirection', () => {
  function createSelection(
    anchorNode: Node | null, anchorOffset: number, focusNode: Node | null, focusOffset: number
  ): Selection {
    return {
      anchorNode,
      anchorOffset,
      focusNode,
      focusOffset,
      getRangeAt: () => null as any,
      rangeCount: 0,
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
      collapse: jest.fn(),
      extend: jest.fn(),
      deleteFromDocument: jest.fn(),
      containsNode: () => false,
      toString: () => '',
      type: 'Range',
    } as unknown as Selection;
  }

  it('returns "forward" if anchorNode or focusNode is missing', () => {
    expect(getSelectionDirection(createSelection(null, 0, null, 0))).toBe('forward');
    expect(getSelectionDirection(createSelection(assertDocument().createTextNode('a'), 0, null, 0))).toBe('forward');
    expect(getSelectionDirection(createSelection(null, 0, assertDocument().createTextNode('a'), 0))).toBe('forward');
  });

  it('returns "forward" if anchorNode equals focusNode and anchorOffset <= focusOffset', () => {
    const node = assertDocument().createTextNode('abc');
    expect(getSelectionDirection(createSelection(node, 1, node, 2))).toBe('forward');
    expect(getSelectionDirection(createSelection(node, 2, node, 2))).toBe('forward');
  });

  it('returns "backward" if anchorNode equals focusNode and anchorOffset > focusOffset', () => {
    const node = assertDocument().createTextNode('abc');
    expect(getSelectionDirection(createSelection(node, 3, node, 2))).toBe('backward');
  });

  it('returns "forward" if anchorNode comes before focusNode', () => {
    const node = assertDocument().getRootNode();
    const node1 = assertDocument().createTextNode('abc');
    const node2 = assertDocument().createTextNode('def');
    node1.compareDocumentPosition = jest.fn(() => node.DOCUMENT_POSITION_FOLLOWING);
    expect(getSelectionDirection(createSelection(node1, 0, node2, 0))).toBe('forward');
  });

  it('returns "backward" if anchorNode comes after focusNode', () => {
    const node = assertDocument().getRootNode();
    const node1 = assertDocument().createTextNode('abc');
    const node2 = assertDocument().createTextNode('def');
    node1.compareDocumentPosition = jest.fn(() => node.DOCUMENT_POSITION_PRECEDING);
    expect(getSelectionDirection(createSelection(node1, 0, node2, 0))).toBe('backward');
  });
});
