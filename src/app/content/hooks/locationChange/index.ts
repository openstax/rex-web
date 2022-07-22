import { locationChange } from '../../../navigation/actions';
import { RouteHookBody } from '../../../navigation/types';
import { loadHighlights } from '../../highlights/hooks';
import { loadPracticeQuestions } from '../../practiceQuestions/hooks';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import { loadStudyGuides } from '../../studyGuides/hooks';
import initializeIntl from '../intlHook';
import registerPageView from '../registerPageView';
import loadBuyPrintConfig from './buyPrintConfig';
import resolveContent from './resolveContent';

const hookBody: RouteHookBody<typeof content> = (services) => {
  const boundRegisterPageView = registerPageView(services);

  return async(action) => {
    // this hook guarantees that a book is loaded for the logic below
    // missing page is ok, that shows the toc with a page not found placeholder
    if ((await resolveContent(services, action.match)).book === undefined) {
      return;
    }

    await Promise.all([
      boundRegisterPageView(action),
      syncSearch(services)(action),
      loadBuyPrintConfig(services)(),
      loadHighlights(services)(locationChange(action)),
      loadStudyGuides(services)(),
      loadPracticeQuestions(services)(),
      initializeIntl(services)(),
    ]);
  };
};

export default hookBody;
