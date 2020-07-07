import googleAnalyticsClient from '../../../../gateways/googleAnalyticsClient';
import { locationChange } from '../../../navigation/actions';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { loadHighlights } from '../../highlights/hooks';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import { loadStudyGuides } from '../../studyGuides/hooks';
import resolveContent from './resolveContent';

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  const state = services.getState();
  const pathname = selectNavigation.pathname(state);

  googleAnalyticsClient.trackPageView(pathname);

  await resolveContent(services, action.match);
  const search = syncSearch(services)(action);
  const highlights = loadHighlights(services)(locationChange(action));
  const studyGuides = loadStudyGuides(services)();

  await Promise.all([search, highlights, studyGuides]);
};

export default hookBody;
