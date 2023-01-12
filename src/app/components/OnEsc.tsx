import React from 'react';
import { useOnKey } from '../reactUtils';

export const callbacks: Array<() => void> = [];

// To be called by components to add an ESC handler
// When ESC is pressed, the last handler whose enabled function returns true is executed
// Returns a function that removes the handler (so the handler is removed when the component unmounts)
export const useOnEsc = (isEnabled: boolean, callback: () => void) => React.useEffect(() => {
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
}, [isEnabled, callback]);

// tslint:disable-next-line:variable-name
export const OnEsc = () => {
  useOnKey({key: 'Escape'}, null, true, () => {
    // Run the last callback only
    // We expect the component that added the callback will re-render after the callback is called,
    // which would remove/re-add the callback
    // So we can pop the callback to be slightly more efficient
    const callback = callbacks.pop();
    if (callback) {
      callback();
    }
  });

  return null;
};
