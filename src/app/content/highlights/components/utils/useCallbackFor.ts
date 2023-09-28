import React from 'react';

// Some functions get recreated but shouldn't be reacted to
// This makes a non-changing callback
export default function useCallbackFor<T extends Array<unknown>>(fn: (...args: T) => unknown) {
    const ref = React.useRef(fn);
    const cb = React.useCallback(
        (...args: T) => ref.current(...args),
        []
    );

    ref.current = fn;
    return cb;
}
