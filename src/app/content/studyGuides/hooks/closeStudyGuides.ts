import { actionHook } from '../../../utils';
import { hookBody } from '../../highlights/hooks/closeMyHighlights';
import { closeStudyGuides } from '../actions';

export const closeStudyGuidesHook = actionHook(closeStudyGuides, hookBody);
