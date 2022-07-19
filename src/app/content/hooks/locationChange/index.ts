import { locationChange } from '../../../navigation/actions';
import { RouteHookBody } from '../../../navigation/types';
import { BookNotFoundError } from '../../../utils';
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

    try {
      await resolveContent(services, action.match);
    } catch (error) {
      if (error instanceof BookNotFoundError) {
        return;
      }
      throw new Error(`Error while resolving content: ${error}`);
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
