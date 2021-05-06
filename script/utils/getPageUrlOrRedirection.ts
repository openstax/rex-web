import { Redirects } from '../../data/redirects/types';

const getPageUrlOrRedirection = (redirects: Redirects, page: string) => {
    return redirects.find(({ from }) => from === page) || page;
};

export default getPageUrlOrRedirection;
