import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import { PracticeQuestionStyles } from './practiceQuestions/types';

export const studyGuidesFeatureFlag = 'studyGuidesEnabled';
export const practiceQuestionsFeatureFlag = 'practiceQuestionsEnabled';

export const maxHighlightsApiPageSize = 200;
export const maxResourcesPerFetch = 10;

export const summaryPageSize = 20;
export const loadMoreDistanceFromBottom = 50;

export const modalQueryParameterName = 'modal';

export const highlightStyles: Array<{label: HighlightColorEnum, passive: string, focused: string}> = [
  {label: HighlightColorEnum.Yellow, passive: '#ffff8a', focused: '#fed200'},
  {label: HighlightColorEnum.Green, passive: '#def99f', focused: '#92d101'},
  {label: HighlightColorEnum.Blue, passive: '#c8f5ff', focused: '#00c3ed'},
  {label: HighlightColorEnum.Purple, passive: '#cbcfff', focused: '#545ec8'},
  {label: HighlightColorEnum.Pink, passive: '#ffc5e1', focused: '#de017e'},
];

export const practiceQuestionStyles: PracticeQuestionStyles[] = [
  {label: 'incorrect', passive: '#C22032', focused: '#C22032', fontColor: '#FFFFFF', hovered: '#C22032'},
  {label: 'correct', passive: '#77AF42', focused: '#77AF42', fontColor: '#FFFFFF', hovered: '#77AF42'},
  {label: 'selected', passive: '#0DC0DC', focused: '#0DC0DC', fontColor: '#FFFFFF', hovered: '#0DC0DC'},
  {label: 'unselected', passive: '#C6C6C6', focused: '#FFFFFF', fontColor: '#606163', hovered: '#0DC0DC'},
];
