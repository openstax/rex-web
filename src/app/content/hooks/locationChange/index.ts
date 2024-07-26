import { actions } from '../../../navigation';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody } from '../../../navigation/types';
import { assertString } from '../../../utils/assertions';
import { loadPracticeQuestions } from '../../practiceQuestions/hooks';
import { assigned, content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import { loadStudyGuides } from '../../studyGuides/hooks';
import initializeIntl from '../intlHook';
import receiveContent from '../receiveContent';
import registerPageView from '../registerPageView';
import resolveContent, { resolveBook } from './resolveContent';

export const contentRouteHookBody: RouteHookBody<typeof content> = (services) => {
  const boundRegisterPageView = registerPageView(services);

  return async(action) => {
    // this hook guarantees that a book is loaded for the logic below
    // missing page is ok, that shows the toc with a page not found placeholder
    if ((await resolveContent(services, action.match)).book === undefined) {
      return;
    }

    // Ensure page head tags get updated before calling analytics
    await receiveContent(services)(actions.locationChange(action));

    await Promise.all([
      boundRegisterPageView(action),
      syncSearch(services)(action),
      loadStudyGuides(services)(),
      loadPracticeQuestions(services)(),
      initializeIntl(services)(),
    ]);
  };
};

export const assignedRouteHookBody: RouteHookBody<typeof assigned> = (services) => {
  const boundRegisterPageView = registerPageView(services);

  return async(action) => {
    const query = selectNavigation.query(services.getState());

    await resolveBook(services, {uuid: assertString(query.book, 'book must be a string')});

    await Promise.all([
      boundRegisterPageView(action),
      initializeIntl(services)(),
    ]);
  };
};
