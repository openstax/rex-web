import UntypedRangy, { RangyRange as BaseRangyRange, RangyStatic, TextRange } from 'rangy';
import 'rangy/lib/rangy-textrange';

export type RangyRange = BaseRangyRange & TextRange;

const rangy = UntypedRangy as RangyStatic<RangyRange & TextRange>;

if (!rangy.initialized) {
  rangy.init();
}

export default rangy;

/*
* Checks whether two RangyRanges share a common ancestor in the DOM tree.
* This is necessary because certain Rangy operations (like intersectsRange)
* will throw an error if the ranges do not share a common ancestor node.
* Using this check before calling intersectsRange prevents runtime exceptions.
*/
const haveCommonAncestor = (range1: RangyRange, range2: RangyRange): boolean => {
  let containerA: typeof range1.commonAncestorContainer | null =
      range1.commonAncestorContainer;
    const containerB: typeof range2.commonAncestorContainer | null =
      range2.commonAncestorContainer;
    while (containerA) {
      let current: typeof containerB | null = containerB;
      while (current) {
        if (containerA === current) return true;
        current = current.parentNode;
      }
      containerA = containerA.parentNode;
    }
    return false;
};

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
    !haveCommonAncestor(range, withinRange) ||
    !range.intersectsRange(withinRange)
  ) {
    return [];
  }

  const match = range.cloneRange();
  range.collapse(false);

  // if we're outside the given range boundaries after collapsing, don't
  // check for more matches
  if (
    !haveCommonAncestor(range, withinRange) ||
    !range.intersectsRange(withinRange)
  ) {
    return [match];
  }

  return [
    match,
    ...findTextInRange(withinRange, text, range),
  ];
};
