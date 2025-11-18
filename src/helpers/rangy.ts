import UntypedRangy, { RangyRange as BaseRangyRange, RangyStatic, TextRange } from 'rangy';
import 'rangy/lib/rangy-textrange';

export type RangyRange = BaseRangyRange & TextRange;

const rangy = UntypedRangy as RangyStatic<RangyRange & TextRange>;

if (!rangy.initialized) {
  rangy.init();
}

export default rangy;

export function safeIntersectsRange(range1: RangyRange, range2: RangyRange): boolean {
  try {
    return range1.intersectsRange(range2);
  } catch {
    return false;
  }
}

export const findTextInRange = (
  withinRange: RangyRange,
  text: string,
  range: RangyRange = rangy.createRange()
): RangyRange[] => {
  let foundMatch;
  try {
    /*
    * findText may throw if the range is invalid or the DOM is in an unexpected state,
    * especially with large or complex documents. Wrapping in try/catch ensures that
    * a thrown error does not break the search flow and allows us to safely return an empty result.
    */
    foundMatch = range.findText(text.trim(), {
      withinRange: withinRange.cloneRange(),
    });
  } catch (err) {
    return [];
  }

  // no matches, or matches were outside the given range boundaries
  if (
    !foundMatch ||
    !safeIntersectsRange(range, withinRange)
  ) {
    return [];
  }

  const match = range.cloneRange();
  range.collapse(false);

  // if we're outside the given range boundaries after collapsing, don't
  // check for more matches
  if (!safeIntersectsRange(range, withinRange)) {
    return [match];
  }

  return [
    match,
    ...findTextInRange(withinRange, text, range),
  ];
};
