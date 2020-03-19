import { Audit } from '../domVisitor';

const crossBookLinks: Audit = (): string[] => {
  // Note: This executes in the browser context
  if (!window) {
    throw new Error(`BUG: Should run in browser context`);
  }

  const isDefined = <X>(x: X): x is Exclude<X, undefined> => x !== undefined;

  return [window.__APP_STORE.getState().errors]
    .map(({error}) => error && error.message)
    .filter(isDefined);
};

export default crossBookLinks;
