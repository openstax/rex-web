import { GetHighlightsColorsEnum, HighlightColorEnum } from '@openstax/highlighter/dist/api';

export const allColors = [
  GetHighlightsColorsEnum.Blue,
  GetHighlightsColorsEnum.Green,
  GetHighlightsColorsEnum.Purple,
  GetHighlightsColorsEnum.Yellow,
] as unknown as HighlightColorEnum[];

export const highlightStyles: Array<{label: HighlightColorEnum, passive: string, focused: string}> = [
  {label: HighlightColorEnum.Yellow, passive: '#ffff8a', focused: '#fed200'},
  {label: HighlightColorEnum.Green, passive: '#def99f', focused: '#92d101'},
  {label: HighlightColorEnum.Blue, passive: '#c8f5ff', focused: '#00c3ed'},
  {label: HighlightColorEnum.Purple, passive: '#cbcfff', focused: '#545ec8'},
];
