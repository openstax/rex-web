import { HighlightColorEnum } from '@openstax/highlights-client';
import { OutputParams } from 'query-string';
import { colorFilterQueryParameterName } from '../constants';
import { colorfilterLabels } from './constants';

export const getColorFiltersFromQuery = (query: OutputParams) => {
  const queryColors = query[colorFilterQueryParameterName] as HighlightColorEnum | HighlightColorEnum[] | undefined;
  if (!queryColors) { return; }

  const colors = (Array.isArray(queryColors) ? queryColors : [queryColors])
    .filter((color) => colorfilterLabels.has(color));

  return colors.length ? colors : undefined;
};
