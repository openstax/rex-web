import { HighlightColorEnum } from '@openstax/highlighter/dist/api';

export const studyGuidesFeatureFlag = 'studyGuidesEnabled';
export const practiceQuestionsFeatureFlag = 'practiceQuestionsEnabled';

export const maxHighlightsApiPageSize = 200;
export const maxResourcesPerFetch = 10;

export const summaryPageSize = 20;
export const loadMoreDistanceFromBottom = 50;

export const modalQueryParameterName = 'modal';
export const colorFilterQueryParameterName = 'colors';
export const locationIdsFilterQueryParameterName = 'locationIds';

export const highlightStyles: Array<{label: HighlightColorEnum, passive: string, focused: string}> = [
  {label: HighlightColorEnum.Yellow, passive: '#ffff8a', focused: '#fed200'},
  {label: HighlightColorEnum.Green, passive: '#def99f', focused: '#92d101'},
  {label: HighlightColorEnum.Blue, passive: '#c8f5ff', focused: '#00c3ed'},
  {label: HighlightColorEnum.Purple, passive: '#cbcfff', focused: '#545ec8'},
  {label: HighlightColorEnum.Pink, passive: '#ffc5e1', focused: '#de017e'},
];

export type TextResizerValue = -2 | -1 | 0 | 1 | 2 | 3;
export const textResizerValues: TextResizerValue[] = [-2, -1, 0, 1, 2, 3];
const textResizerScales = [0.75, 0.9, 1, 1.25, 1.5, 2];
export const textResizerValueMap = new Map(textResizerValues.map((v, i) => [v, textResizerScales[i]]));
export const textResizerMinValue = textResizerValues[0];
export const textResizerMaxValue = textResizerValues[textResizerValues.length - 1];
export const textResizerDefaultValue = textResizerValues[2];
export const textResizerStorageKey = 'textSize';
