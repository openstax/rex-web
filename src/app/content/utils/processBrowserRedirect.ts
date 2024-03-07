import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';

export const processBrowserRedirect = async(services: {history: History}) => {
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

    console.log(services.history.location.pathname)
  for (const {from, to} of redirects) {
    if (from === services.history.location.pathname) {
      services.history.replace(to);
      return true;
    }
  }

  return false;
};
