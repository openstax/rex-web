import { actions } from '../../../navigation';
import * as selectNavigation from '../../../navigation/selectors';
import { RouteHookBody, AnyMatch } from '../../../navigation/types';
import { assertString } from '../../../utils/assertions';
import { loadPracticeQuestions } from '../../practiceQuestions/hooks';
import { assigned, content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import { loadStudyGuides } from '../../studyGuides/hooks';
import initializeIntl from '../intlHook';
import receiveContent from '../receiveContent';
import registerPageView from '../registerPageView';
import loadBuyPrintConfig from './buyPrintConfig';
import resolveContent, { resolveBook } from './resolveContent';
import { replace } from "../../../navigation/actions";
import { assertWindow } from "../../../utils/browser-assertions";

export const contentRouteHookBody: RouteHookBody<typeof content> = (services) => {
  const boundRegisterPageView = registerPageView(services);

  return async(action) => {

    if ('courseId' in action.match.params && 'resourceId' in action.match.params && services.launchToken === undefined) {
      const window = assertWindow();
      const tokenRedirect = services.router.findRoute(
        `/courses/launch/${action.match.params.courseId}/resources/${action.match.params.resourceId}`,
      );
      return services.dispatch(replace(tokenRedirect as AnyMatch, {
        search: `?r=${encodeURIComponent(window.location.toString())}`,
      }));
    }

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
      loadBuyPrintConfig(services)(),
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
