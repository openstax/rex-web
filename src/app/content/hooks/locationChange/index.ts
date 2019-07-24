import { RouteHookBody } from '../../../navigation/types';
import { content } from '../../routes';
import { syncSearch } from '../../search/hooks';
import resolveContent from './resolveContent';

interface ErrorMaker {
  bang: () => string
}

const hookBody: RouteHookBody<typeof content> = (services) => async(action) => {
  ({} as any as ErrorMaker).bang();

  await resolveContent(services, action.match);
  await syncSearch(services)(action);
};

export default hookBody;
