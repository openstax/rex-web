/**
 * Redux Bridge
 *
 * Provides a properly typed Provider component to work around React 16 + react-redux
 * type incompatibility issues. React 16 types expect legacy class component properties
 * (like 'refs') that modern react-redux Provider doesn't have.
 *
 * Import Provider from this file instead of directly from 'react-redux'.
 * This module re-exports all react-redux exports for convenience.
 */

import { Provider as ReduxProvider } from 'react-redux';

// Type assertion to fix React 16 + react-redux Provider compatibility issue
export const Provider = ReduxProvider as any; // eslint-disable-line @typescript-eslint/no-explicit-any

// Re-export everything else from react-redux (except Provider which we override above)
export {
  connect,
  useDispatch,
  useSelector,
  useStore,
  batch,
  shallowEqual,
  createDispatchHook,
  createSelectorHook,
  createStoreHook,
  ReactReduxContext,
} from 'react-redux';
