export type PageRedirect = { bookId: string, pageId: string, pathname: string, query?: string };
export type ExplicitRedirect = { pathname: string, to: string };
export type RedirectsData = Array<PageRedirect | ExplicitRedirect>;
export type Redirects = Array<{ from: string, to: string }>;
