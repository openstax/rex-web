import { RouteHookBody } from '../../../navigation/types';
import { content } from '../../routes';
import resolveContent from './resolveContent';
import resolveSearch from './resolveSearch';

const hookBody: RouteHookBody<typeof content> = (services) => async({match}) => {
  const {book} = await resolveContent(services, match);
  await resolveSearch(book, services);
};

export default hookBody;
