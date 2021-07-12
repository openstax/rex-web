import { AppServices, MiddlewareAPI } from '../../../types';
import { receiveMyPlacements } from '../actions';
import * as select from '../selectors';
import { loadMyPlacements } from '../utils';

const hookBody = (services: MiddlewareAPI & AppServices) => async() => {
  const {dispatch, getState, placementsClient} = services;
  const state = getState();

  const loaded = select.myPlacementsLoaded(state);
  if ( loaded ) { return }

  const myPlacements = await loadMyPlacements({
    placementsClient,
  });

  dispatch(receiveMyPlacements({myPlacements}));
};

export default hookBody;
