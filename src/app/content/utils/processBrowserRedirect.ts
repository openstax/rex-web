import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';
import { assertWindow } from '../../utils';

export const processBrowserRedirect = async(services: {history: History}) => {
  const window = assertWindow();
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      if (!to.startsWith('/books')) {
        window.location.pathname = to;
        return true;
      }
      services.history.replace(to);
      return true;
    }
  }

  return false;
};
