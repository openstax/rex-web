import { History } from 'history';
import { Redirects } from '../../../../data/redirects/types';

export const processBrowserRedirect = async(services: {history: History}) => {
  console.log('process: ', services.history.location.pathname);
  const redirects: Redirects = await fetch('/rex/redirects.json')
    .then((res) => res.json())
    .catch(() => []);

  for (const {from, to} of redirects) {
    console.log('from: ', from);
    if (from === services.history.location.pathname) {
      services.history.replace(to);
      return true;
    }
  }

  return false;
};
