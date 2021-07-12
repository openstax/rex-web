import _ from 'lodash';
import { createSelector } from 'reselect';
import * as parentSelectors from '../selectors';
import { Config } from './types'

export const localState = createSelector(
  parentSelectors.localState,
  (parentState) => parentState.placements
);

export const myPlacements = createSelector(
  localState,
  (state) => state.myPlacements || []
)

export const myContentBottomPlacements = createSelector(
  myPlacements,
  (placements) => _.filter(placements, (placement) => {
    const config = placement.config as Config;
    return config.type === "content_bottom";
  })
)

export const myPlacementsLoaded = createSelector(
  localState,
  (state) => { return state.myPlacements !== null }
);
