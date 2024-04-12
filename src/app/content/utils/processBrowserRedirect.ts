import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';
import { assertWindow } from '../../utils';
import { RouterService } from "../../navigation/routerService";

export const processBrowserRedirect = async(services: {router: RouterService, history: History}) => {
  const window = assertWindow();
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      if (!services.router.findRoute(to)) {
        window.location.assign(to);
        return true;
      }
      services.history.replace(to);
      return true;
    }
  }

  return false;
};
