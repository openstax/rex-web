import { Redirects } from '../../data/redirects/types';

const checkIfPageHasRedirect = (redirects: Redirects, page: string) => {
    return redirects.find(({ from }) => from === page);
};

export default checkIfPageHasRedirect;
