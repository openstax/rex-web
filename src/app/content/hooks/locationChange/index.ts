import { RouteHookBody } from '../../../navigation/types';
import { loadHighlights } from '../../highlights/hooks';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import resolveContent from './resolveContent';

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  await resolveContent(services, action.match);
  const search = syncSearch(services)(action);
  const highlights = loadHighlights(services)(action);

  await Promise.all([search, highlights]);
};

export default hookBody;
