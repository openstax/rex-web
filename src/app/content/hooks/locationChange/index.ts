import { user as userSelector } from '../../../auth/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { closeCallToActionPopup, openCallToActionPopup } from '../../actions';
import { loadHighlights } from '../../highlights/hooks';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import { showCTAPopup } from '../../selectors';
import resolveContent from './resolveContent';

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  await resolveContent(services, action.match);
  const search = syncSearch(services)(action);
  const highlights = loadHighlights(services)();

  const state = services.getState();
  const showCTA = showCTAPopup(state);
  const user = userSelector(state);

  if (showCTA === null && !user) {
    setTimeout(() => {
      services.dispatch(openCallToActionPopup());
    }, 5000);
  } else if (showCTA === true) {
    services.dispatch(closeCallToActionPopup());
  }

  await Promise.all([search, highlights]);
};

export default hookBody;
