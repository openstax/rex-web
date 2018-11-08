import React from 'react';
import { connect } from 'react-redux';
import * as selectors from '../selectors';
import * as utils from '../utils';

const connectNavigationProvider = connect((state: RootState) => ({
  pathname: selectors.pathname(state),
}));

export default connectNavigationProvider(({routes, pathname}: {routes: Route[], pathname: string}) => {
  const match = utils.findRouteMatch(routes, pathname);

  if (match) {
    return React.createElement(match.route.component);
  } else {
    return null;
  }
});
