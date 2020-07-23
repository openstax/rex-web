import { ScrollTarget } from '../../../navigation/types';
import { HighlightScrollTarget } from '../types';

const isHighlightScrollTarget = (target: ScrollTarget): target is HighlightScrollTarget => {
  if (target.type === 'highlight' && typeof target.id === 'string') { return true; }
  return false;
};

export default isHighlightScrollTarget;
