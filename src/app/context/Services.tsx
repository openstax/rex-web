import React from 'react';
import { useStore } from 'react-redux';
import { AppServices, MiddlewareAPI } from '../types';

export const servicesContext = React.createContext({} as AppServices & MiddlewareAPI);

const {Consumer, Provider} = servicesContext;

export const useServices = () => ({
  ...React.useContext(servicesContext),
  dispatch: useStore().dispatch,
  getState: useStore().getState(),
});

export {
  Consumer,
  Provider,
};

interface ServiceConsumer {
  services: AppServices & MiddlewareAPI;
}

/* tslint:disable-next-line:variable-name */
export default <P extends ServiceConsumer>(Component: React.ComponentType<P>) =>
  (props: Pick<P, Exclude<keyof P, keyof ServiceConsumer>>) => <Consumer>
    {(services) => {
      // @ts-ignore - remove this when https://github.com/Microsoft/TypeScript/issues/28748 is resolved
      return <Component services={services} {...props} />;
    }}
  </Consumer>;
