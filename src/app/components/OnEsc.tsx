import { useOnKey } from '../reactUtils';

export const callbacks: Array<() => void> = [];

// To be called by the useOnEsc helper function to add an ESC handler
// When ESC is pressed, the last handler whose enabled function returns true is executed
// Returns a function that removes the handler (so it works with React.useEffect)
export const manageOnEscHandler = (isEnabled: boolean, callback: () => void) => () => {
  if (!isEnabled) {
    return undefined;
  }

  callbacks.push(callback);

  return () => {
    const index = callbacks.lastIndexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
    }
  };
};

// tslint:disable-next-line:variable-name
export const OnEsc = () => {
  useOnKey({key: 'Escape'}, null, true, () => {
    const callback = callbacks.pop();
    if (callback) {
      callback();
    }
  });

  return null;
};
