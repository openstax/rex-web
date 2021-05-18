import { HighlightColorEnum } from '@openstax/highlighter/dist/api';
import theme from '../theme';

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

const getPrimaryBaseColors = (primaryColors: {[key: string]: {[key: string]: string}}) => {
  const primaryBases: { [key: string]: string } = {};

  // tslint:disable-next-line: max-line-length
  Object.keys(primaryColors).forEach((color) => {primaryBases[color] = primaryColors[color].base; });
  return primaryBases;
};

export const searchButtonStyles: {[key: string]: string} = {
  gray: '#5D6062',
  transparent: 'transparent',
  ...getPrimaryBaseColors(theme.color.primary) as {},
};
