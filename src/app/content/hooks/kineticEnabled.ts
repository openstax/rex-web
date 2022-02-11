import Sentry from '../../../helpers/Sentry';
import { receiveFeatureFlags } from '../../featureFlags/actions';
import { ActionHookBody } from '../../types';
import { receivePage } from '../actions';
import { hasOSWebData } from '../guards';
import * as select from '../selectors';

const hookBody: ActionHookBody<typeof receivePage> = (services) => async() => {
  const { getState, dispatch } = services;

  const state = getState();
  const book = select.book(state);

  if (!book) {
    return;
  }

  if (!hasOSWebData(book)) {
    return;
  }

  const result = await fetch('https://kinetic.openstax.org/api/v1/eligibility?book=' + book.slug)
    .then((response) => response.json())
    .catch((e) => {
      Sentry.captureException(e);
      return {eligible: false};
    });

  if (result.eligible) {
    dispatch(receiveFeatureFlags(['kineticEnabled']));
  }
};

export default hookBody;
