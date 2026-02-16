import { ActionHookBody } from '../../types';
import { actionHook } from '../../utils';
import { locationChange } from '../../navigation/actions';

export const hookBody: ActionHookBody<typeof locationChange> = ({ promiseCollector }) => {
    return () => {
        if (typeof document === 'undefined') {
            return;
        }

        const body = document.body;
        body.setAttribute('data-rex-loading', 'true');

        return (async() => {
            try {
                await promiseCollector.calm();
            } finally {
                const currentLoaded = parseInt(body.getAttribute('data-rex-loaded') || '0', 10);
                body.setAttribute('data-rex-loaded', (currentLoaded + 1).toString());
                body.removeAttribute('data-rex-loading');
            }
        })();
    };
};

// Custom wrapper that prevents the promise from being added to promiseCollector
// This avoids a deadlock where the hook waits for promiseCollector.calm()
// but is itself added to the collector
const pageLoadTrackerMiddleware = (services: Parameters<typeof hookBody>[0]) => {
    const boundHook = hookBody(services);

    return (action: ReturnType<typeof locationChange>) => {
        const promise = boundHook(action);
        // Execute the promise but don't return it to actionHook
        // This prevents it from being added to promiseCollector
        if (promise) {
            promise.catch((e) => {
                throw new Error(`pageLoadTracker error: ${e}`);
            });
        }
        return;
    };
};

export default actionHook(locationChange, pageLoadTrackerMiddleware);
