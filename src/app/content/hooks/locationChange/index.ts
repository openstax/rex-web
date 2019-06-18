import { RouteHookBody } from '../../../navigation/types';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import resolveContent from './resolveContent';

const hookBody: RouteHookBody<typeof content> = (services) => async({match}) => {
  await resolveContent(services, match);
  await syncSearch(services);
};

export default hookBody;
