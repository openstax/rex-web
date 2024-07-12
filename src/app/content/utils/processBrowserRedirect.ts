import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';
import { RouterService } from '../../navigation/routerService';
import { assertWindow } from '../../utils';
import { Dispatch } from '../../types';
import { replace } from '../../navigation/actions';
import { AnyMatch } from '../../navigation/types';

export const processBrowserRedirect = async(services: {
  router: RouterService,
  history: History,
  dispatch: Dispatch
}) => {
  const window = assertWindow();
  const base = window.location.origin;
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      const match = services.router.findRoute(base + to);
      services.dispatch(replace(match as AnyMatch));
      return true;
    }
  }

  return false;
};
