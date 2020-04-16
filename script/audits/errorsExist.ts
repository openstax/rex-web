import { Audit } from '../domVisitor';

const errorsExist: Audit = (): string[] => {
  // Note: This executes in the browser context
  if (!window) {
    throw new Error(`BUG: Should run in browser context`);
  }

  return [window.__APP_STORE.getState().errors]
    .map(({error}) => error && error.message)
    .filter((x): x is string => typeof x === 'string');
};

export default errorsExist;
