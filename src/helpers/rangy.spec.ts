import { mockRange } from '../test/mocks/rangy';
import { resetModules } from '../test/utils';
import { RangyRange } from './rangy';

let rangy: typeof import ('../test/mocks/rangy').default;

beforeEach(() => {
  resetModules();
  jest.resetAllMocks();

  rangy = require('rangy');
});

describe('rangy', () => {
  it('initializes rangy if necessary', () => {
    rangy.initialized = false;
    require('./rangy');
    expect(rangy.init).toHaveBeenCalled();
  });

  it('doesn\'t initializes rangy if unnecessary', () => {
    rangy.initialized = true;
    require('./rangy');
    expect(rangy.init).not.toHaveBeenCalled();
  });
});

describe('findTextInRange', () => {
  let findTextInRange: typeof import ('./rangy').findTextInRange;

  beforeEach(() => {
    findTextInRange = require('./rangy').findTextInRange;
  });

  it('clones every found match', () => {
    const commonAncestor = { nodeType: 2, nodeName: 'SPAN' };
    const withinRange = mockRange('', { nodeName: 'DIV', parentNode: commonAncestor});
    const searchRange = mockRange('', commonAncestor);

    searchRange.findText
      .mockReturnValue(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    searchRange.intersectsRange.mockReturnValue(true);

    const firstMatch = mockRange();
    const secondMatch = mockRange();

    searchRange.cloneRange
      .mockReturnValue(searchRange)
      .mockReturnValueOnce(firstMatch)
      .mockReturnValueOnce(secondMatch);

    rangy.createRange.mockReturnValueOnce(searchRange);

    const result = findTextInRange(withinRange as unknown as RangyRange, 'cool text');

    expect(result.length).toBe(2);
    expect(result[0]).toBe(firstMatch);
    expect(result[1]).toBe(secondMatch);
  });

  it('does not clone every found match(commonAncestor unmatch)', () => {
    const commonAncestor = { nodeType: 2, nodeName: 'SPAN' };
    const withinRange = mockRange('', { nodeName: 'DIV'});
    const searchRange = mockRange('', commonAncestor);

    searchRange.findText
      .mockReturnValue(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    searchRange.intersectsRange.mockReturnValue(true);

    const firstMatch = mockRange();
    const secondMatch = mockRange();

    searchRange.cloneRange
      .mockReturnValue(searchRange)
      .mockReturnValueOnce(firstMatch)
      .mockReturnValueOnce(secondMatch);

    rangy.createRange.mockReturnValueOnce(searchRange);

    const result = findTextInRange(withinRange as unknown as RangyRange, 'cool text');

    expect(result.length).toBe(0);
  });

  it('does not clone every found match(commonAncestor error)', () => {
    const commonAncestor = { nodeType: 2, nodeName: 'SPAN' };
    const withinRange = mockRange('', undefined);
    const searchRange = mockRange('', commonAncestor);

    searchRange.findText
      .mockReturnValue(false)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);

    searchRange.intersectsRange.mockReturnValue(true);

    const firstMatch = mockRange();
    const secondMatch = mockRange();

    searchRange.cloneRange
      .mockReturnValue(searchRange)
      .mockReturnValueOnce(firstMatch)
      .mockReturnValueOnce(secondMatch);

    rangy.createRange.mockReturnValueOnce(searchRange);

    const result = findTextInRange(withinRange as unknown as RangyRange, 'cool text');

    expect(result.length).toBe(0);
  });

  it('doesn\'t look for more matches if outside given range', () => {
    const commonAncestor = { nodeType: 2, nodeName: 'SPAN' };
    const withinRange = mockRange('', commonAncestor);
    const searchRange = mockRange('', { nodeName: 'DIV', parentNode: commonAncestor});

    searchRange.findText.mockReturnValue(true);

    searchRange.intersectsRange
      .mockReturnValue(false)
      .mockReturnValueOnce(true)
    ;

    const firstMatch = mockRange('', { nodeName: 'DIV', parentNode: commonAncestor });

    searchRange.cloneRange.mockReturnValue(firstMatch);

    rangy.createRange.mockReturnValueOnce(searchRange);

    const result = findTextInRange(withinRange as unknown as RangyRange, 'cool text');

    expect(result.length).toBe(1);
    expect(searchRange.findText).toHaveBeenCalledTimes(1);
  });
});

describe('findText', () => {
  let findTextInRange: typeof import ('./rangy').findTextInRange;

  beforeEach(() => {
    findTextInRange = require('./rangy').findTextInRange;
  });

  it('removes leading and following whitespace on searched text', () => {
    const searchRange = mockRange();
    rangy.createRange.mockReturnValue(searchRange);

    const withinRange = mockRange();
    withinRange.cloneRange.mockReturnValue(withinRange);

    findTextInRange(withinRange as unknown as RangyRange, ' some text ');
    expect(searchRange.findText).toHaveBeenCalledWith('some text', expect.objectContaining({
      withinRange,
    }));
  });

  it('returns [] if findText throws', () => {
    const withinRange = mockRange();
    const searchRange = mockRange();
    rangy.createRange.mockReturnValue(searchRange);

    searchRange.findText.mockImplementation(() => { throw new Error('fail'); });

    const result = findTextInRange(withinRange as unknown as RangyRange, 'fail');
    expect(result).toEqual([]);
  });
});
