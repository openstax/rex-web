import { HighlightColorEnum } from '@openstax/highlighter/dist/api';

export const studyGuidesFeatureFlag = 'studyGuidesEnabled';
export const practiceQuestionsFeatureFlag = 'practiceQuestionsEnabled';

export const maxHighlightsApiPageSize = 200;
export const maxResourcesPerFetch = 10;

export const summaryPageSize = 20;
export const loadMoreDistanceFromBottom = 50;

export const messageQueryParameterName = 'message';
export const modalQueryParameterName = 'modal';
export const colorFilterQueryParameterName = 'colors';
export const locationIdsFilterQueryParameterName = 'locationIds';

export const highlightStyles: Array<{
  label: HighlightColorEnum;
  passive: string;
  focused: string;
  focusBorder: string;
}> = [
  {
    label: HighlightColorEnum.Yellow,
    passive: '#ffff8a',
    focused: '#fed200',
    focusBorder: '#8f7700',
  },
  {
    label: HighlightColorEnum.Green,
    passive: '#def99f',
    focused: '#92d101',
    focusBorder: '#4e6f01',
  },
  {
    label: HighlightColorEnum.Blue,
    passive: '#c8f5ff',
    focused: '#00c3ed',
    focusBorder: '#006880',
  },
  {
    label: HighlightColorEnum.Purple,
    passive: '#cbcfff',
    focused: '#545ec8',
    focusBorder: '#141a3e',
  },
  {
    label: HighlightColorEnum.Pink,
    passive: '#ffc5e1',
    focused: '#de017e',
    focusBorder: '#560131',
  },
];
