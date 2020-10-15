import { ScrollTarget } from '../../navigation/types';
import { HighlightScrollTarget } from './types';

export const isHighlightScrollTarget = (target: ScrollTarget): target is HighlightScrollTarget => {
  return target.type === 'highlight' && typeof target.id === 'string';
};
