import UntypedRangy, { RangyRange as BaseRangyRange, RangyStatic, TextRange } from 'rangy';
import 'rangy/lib/rangy-textrange';

type RangyRange = BaseRangyRange & TextRange;

const rangy = UntypedRangy as RangyStatic<RangyRange & TextRange>;

export default rangy;

export const findTextInRange = (withinRange: RangyRange, text: string, carriedRange?: RangyRange): RangyRange[] => {
  const range = carriedRange || rangy.createRange();
  const foundMatch = range.findText(text, {
    withinRange: withinRange.cloneRange(),
  });

  if (!foundMatch) {
    return [];
  }

  const nextRange = range.cloneRange();
  nextRange.collapse(false);

  return [
    range,
    ...findTextInRange(withinRange, text, nextRange),
  ];
};
