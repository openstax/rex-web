import createTestServices from '../../../test/createTestServices';
import { locationChange } from '../../navigation/actions';
import { assertDocument } from '../../utils';
import { MiddlewareAPI } from '../../types';
import { hookBody } from './pageLoadTracker';

describe('pageLoadTracker', () => {
    let services: MiddlewareAPI & ReturnType<typeof createTestServices>;
    let hook: any;

    beforeEach(() => {
        services = {
            ...createTestServices(),
            dispatch: jest.fn(),
            getState: jest.fn(),
        };
        hook = hookBody(services);
        assertDocument().body.setAttribute('data-rex-loaded', '0');
        assertDocument().body.removeAttribute('data-rex-loading');
    });

    it('increments data-rex-loaded and toggles data-rex-loading', async () => {
        let calmComplete: any;
        const calmPromise = new Promise<void>((resolve) => {
            calmComplete = resolve;
        });

        jest.spyOn(services.promiseCollector, 'calm').mockReturnValue(calmPromise);

        const action = locationChange({
            location: {} as any,
            match: {} as any,
            action: 'PUSH',
        });

        const hookPromise = hook(action);

        expect(assertDocument().body.getAttribute('data-rex-loading')).toBe('true');
        expect(assertDocument().body.getAttribute('data-rex-loaded')).toBe('0');

        calmComplete();
        await hookPromise;

        expect(assertDocument().body.getAttribute('data-rex-loading')).toBeNull();
        expect(assertDocument().body.getAttribute('data-rex-loaded')).toBe('1');
    });

    it('increments correctly from a non-zero value', async () => {
        assertDocument().body.setAttribute('data-rex-loaded', '5');
        jest.spyOn(services.promiseCollector, 'calm').mockResolvedValue(undefined);

        const action = locationChange({
            location: {} as any,
            match: {} as any,
            action: 'PUSH',
        });

        await hook(action);

        expect(assertDocument().body.getAttribute('data-rex-loaded')).toBe('6');
    });

    it('handles errors from promiseCollector.calm()', async () => {
        const testError = new Error('Test error from calm');
        jest.spyOn(services.promiseCollector, 'calm').mockRejectedValue(testError);
        jest.spyOn(console, 'error').mockImplementation(() => { });

        const action = locationChange({
            location: {} as any,
            match: {} as any,
            action: 'PUSH',
        });

        const promise = hook(action);

        await expect(promise).rejects.toThrow('Test error from calm');

        expect(assertDocument().body.getAttribute('data-rex-loaded')).toBe('1');
        expect(assertDocument().body.getAttribute('data-rex-loading')).toBeNull();
    });

    it('returns undefined when document is undefined', () => {
        const originalDocument = global.document;
        delete (global as any).document;

        const action = locationChange({
            location: {} as any,
            match: {} as any,
            action: 'PUSH',
        });

        const result = hook(action);

        expect(result).toBeUndefined();

        (global as any).document = originalDocument;
    });
});

describe('pageLoadTracker middleware', () => {
    it('throws error when hookBody fails', async () => {
        const services = {
            ...createTestServices(),
            dispatch: jest.fn(),
            getState: jest.fn(),
        };

        const testError = new Error('Test error from calm');
        jest.spyOn(services.promiseCollector, 'calm').mockRejectedValue(testError);

        assertDocument().body.setAttribute('data-rex-loaded', '0');
        assertDocument().body.removeAttribute('data-rex-loading');

        const middleware = require('./pageLoadTracker').default(services);
        const store = { dispatch: services.dispatch, getState: services.getState };
        const next = jest.fn((action) => action);

        const action = locationChange({
            location: {} as any,
            match: {} as any,
            action: 'PUSH',
        });

        let caughtError: any = null;
        let resolveError: (value: unknown) => void;
        const errorCaught = new Promise((resolve) => {
            resolveError = resolve;
        });

        const unhandledRejectionHandler = (error: Error) => {
            caughtError = error;
            resolveError(true);
        };

        process.on('unhandledRejection' as any, unhandledRejectionHandler);

        middleware(store)(next)(action);

        await Promise.race([
            errorCaught,
            new Promise(resolve => setTimeout(resolve, 500))
        ]);

        expect(caughtError.message).toBe('pageLoadTracker Error: Test error from calm');

        process.off('unhandledRejection' as any, unhandledRejectionHandler);
    });
});
