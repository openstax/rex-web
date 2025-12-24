import React from 'react';
import { routes } from '../..';
import { H3 } from '../../components/Typography';
import Panel from './Panel';

const Routes = () => <Panel title='Routes'>
  {routes.map((route) => <div key={route.name}>
    <H3>{route.name}</H3>
    path: {route.paths.map((path) => <React.Fragment key={path}>{path}<br /></React.Fragment>)}
  </div>)}
</Panel>;

export default Routes;
