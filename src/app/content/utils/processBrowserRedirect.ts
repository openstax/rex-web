import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';
import { assertWindow } from '../../utils';
import { RouterService } from '../../navigation/routerService';
import { notFound } from '../../errors/routes';
import { matchForRoute } from '../../navigation/utils';

export const processBrowserRedirect = async(services: {router: RouterService, history: History}) => {
  const window = assertWindow();
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      if (matchForRoute(notFound, services.router.findRoute(to))) {
        window.location.href = window.location.origin + to;
      }
      services.history.replace(to);
      return true;
    }
  }

  return false;
};
