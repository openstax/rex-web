import React from 'react';
import { routes } from '../..';

// tslint:disable-next-line:variable-name
const Routes: React.SFC = () => <div>
  <h1>REX Routes</h1>

  {routes.map((route) => <div>
    <h2>{route.name}</h2>
    path{route.paths.length > 1 ? 's' : ''}: {route.paths}
  </div>)}
</div>;

export default Routes;
