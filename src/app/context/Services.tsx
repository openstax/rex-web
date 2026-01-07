import React from 'react';
import { useStore } from 'react-redux';
import { AppServices, MiddlewareAPI } from '../types';

export const servicesContext = React.createContext({} as AppServices & MiddlewareAPI);

const {Consumer, Provider} = servicesContext;

export const useServices = (): AppServices & MiddlewareAPI => {
  const appServices = React.useContext(servicesContext);
  const {dispatch, getState} = useStore();

  return React.useMemo(() => ({
    ...appServices, dispatch, getState,
  }), [appServices, dispatch, getState]);
};

export {
  Consumer,
  Provider,
};

export interface ServiceConsumer {
  services: AppServices & MiddlewareAPI;
}

export default <P extends ServiceConsumer>(Component: React.ComponentType<P>) =>
  (props: Pick<P, Exclude<keyof P, keyof ServiceConsumer>>) => <Consumer>
    {(services) => {
      // @ts-expect-error - remove this when https://github.com/Microsoft/TypeScript/issues/28748 is resolved
      return <Component services={services} {...props} />;
    }}
  </Consumer>;
