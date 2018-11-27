import React, { Attributes } from 'react';
import { AppServices } from '../types';

const {Consumer, Provider} = React.createContext({} as AppServices);

export {
  Consumer,
  Provider,
};

interface ServiceConsumer {
  services: AppServices;
}

/* tslint:disable-next-line:variable-name */
export default <P extends ServiceConsumer & Attributes>(Component: React.ComponentType<P>) =>
  (props: Pick<P, Exclude<keyof P, keyof ServiceConsumer>>) => <Consumer>
    {(services) => <Component services={services} {...props} />}
  </Consumer>;
