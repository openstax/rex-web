import { Window } from '@openstax/types/lib.dom';

// Removes query params from the address bar without navigating, keeping the path, other params and hash
export const removeQueryParams = (window: Window, keys: string[]) => {
  const searchParams = new URLSearchParams(window.location.search);
  const foundKeys = keys.filter((key) => searchParams.has(key));

  if (foundKeys.length === 0) {
    return;
  }

  foundKeys.forEach((key) => searchParams.delete(key));
  const search = searchParams.toString();
  window.history.replaceState(
    {},
    window.document.title,
    window.location.pathname + (search ? `?${search}` : '') + window.location.hash
  );
};
