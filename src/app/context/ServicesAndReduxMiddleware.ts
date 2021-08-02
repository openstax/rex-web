import React from 'react';
import { AppServicesAndReduxMiddleware } from '../types';

export const servicesAndReduxMiddlewareContext = React.createContext({} as AppServicesAndReduxMiddleware);

const {Consumer, Provider} = servicesAndReduxMiddlewareContext;

export const useServicesAndReduxMiddleware = () => React.useContext(servicesAndReduxMiddlewareContext);

export {
  Consumer,
  Provider,
};

interface ServiceAndReduxMiddlewareConsumer {
  servicesAndReduxMiddleware: AppServicesAndReduxMiddleware;
}

/* tslint:disable-next-line:variable-name */
export default <P extends ServiceAndReduxMiddlewareConsumer>(Component: React.ComponentType<P>) =>
  (props: Pick<P, Exclude<keyof P, keyof ServiceAndReduxMiddlewareConsumer>>) => <Consumer>
    {(servicesAndReduxMiddleware) => {
      // @ts-ignore - remove this when https://github.com/Microsoft/TypeScript/issues/28748 is resolved
      return <Component services={servicesAndReduxMiddleware} {...props} />;
    }}
  </Consumer>;
