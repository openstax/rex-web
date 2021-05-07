import { Redirects } from '../../data/redirects/types';

const getPageOrRedirectedUrl = (redirects: Redirects, page: string) => {
  const redirect = redirects.find(({ to }) => to === page);
  return redirect ? redirect.from : page;
};

export default getPageOrRedirectedUrl;
