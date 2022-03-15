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

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  await resolveContent(services, action.match);

  await Promise.all([
    registerPageView(services)(action),
    syncSearch(services)(action),
    loadBuyPrintConfig(services)(),
    loadHighlights(services)(locationChange(action)),
    loadStudyGuides(services)(),
    loadPracticeQuestions(services)(),
    initializeIntl(services)(),
  ]);
};

export default hookBody;
