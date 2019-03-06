import React from 'react';
import { routes } from '../..';

// tslint:disable-next-line:variable-name
const Routes: React.SFC = () => <div>
  <h2>REX Routes</h2>

  {routes.map((route) => <div key={route.name}>
    <h3>{route.name}</h3>
    path: {route.paths}
  </div>)}
</div>;

export default Routes;
