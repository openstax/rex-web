import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';
import { RouterService } from '../../navigation/routerService';
import { Dispatch } from '../../types';
import { replace } from '../../navigation/actions';
import { AnyMatch } from '../../navigation/types';

export const processBrowserRedirect = async(services: {
  router: RouterService,
  history: History,
  dispatch: Dispatch
}) => {
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      services.dispatch(replace(services.router.findRoute(to) as AnyMatch));
      return true;
    }
  }

  return false;
};
