import { onEscCallbacks, useOnKey } from '../reactUtils';

const OnEsc = () => {
  useOnKey({key: 'Escape'}, null, true, () => {
    // Run the last callback only
    // We expect the component that added the callback will re-render after the callback is called,
    // which would remove/re-add the callback
    // So we can pop the callback to be slightly more efficient
    const callback = onEscCallbacks.pop();
    if (callback) {
      callback();
    }
  });

  return null;
};

export default OnEsc;
