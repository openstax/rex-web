import { Redirects } from '../../data/redirects/types';

const getPageOrRedirectedUrls = (redirects: Redirects, page: string) => {
  const redirectedUrls = redirects.filter(({ to }) => to === page);
  return redirectedUrls ? redirectedUrls.map(({from}) => from) : [page];
};

export default getPageOrRedirectedUrls;
