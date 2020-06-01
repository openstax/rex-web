import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.studyGuides
);

export const studyGuidesEnabled = createSelector(
  localState,
  (state) => state.isEnabled
);

export const studyGuidesSummary = createSelector(
  localState,
  (state) => state.summary
);

export const studyGuidesSummaryIsNotEmpty = createSelector(
  studyGuidesSummary,
  (summary) => summary !== null
    && summary.countsPerSource
    && Object.keys(summary.countsPerSource).length > 0
);

export const studyGuidesOpen = createSelector(
  localState,
  (state) => state.open
);
