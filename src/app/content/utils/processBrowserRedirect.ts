import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';
import { RouterService } from '../../navigation/routerService';
import { assertWindow } from '../../utils';
import { matchForRoute } from '../../navigation/utils';
import { external } from '../../errors/routes';

export const processBrowserRedirect = async(services: {router: RouterService, history: History}) => {
  const window = assertWindow();
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      if (matchForRoute(external, services.router.findRoute(to))) {
        window.location.href = window.location.origin + to;
      }
      services.history.replace(to);
      return true;
    }
  }

  return false;
};
