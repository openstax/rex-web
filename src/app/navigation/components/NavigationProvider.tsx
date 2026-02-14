import { Location } from 'history';
import React from 'react';
import { connect } from 'react-redux';
import ErrorBoundary from '../../errors/components/ErrorBoundary';
import { AppState } from '../../types';
import * as selectors from '../selectors';
import { AnyRoute } from '../types';
import * as utils from '../utils';

const connectNavigationProvider = connect((state: AppState) => ({
  location: selectors.location(state),
}));

// Type assertion to fix React 16 + redux connect + ErrorBoundary children type compatibility
// In some environments, connect() + ErrorBoundary combination causes TypeScript to infer 'never' for children
const TypedErrorBoundary = ErrorBoundary as any;

export default connectNavigationProvider(({ routes, location }: { routes: AnyRoute[], location: Location }) => {
  const match = utils.findRouteMatch(routes, location);

  if (match) {
    const Component = match.route.component;
    return <TypedErrorBoundary><Component /></TypedErrorBoundary >;
  } else {
    return null;
  }
});
