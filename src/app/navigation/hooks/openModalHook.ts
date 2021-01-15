import { modalQueryParameterName } from '../../content/constants';
import { AppServices, MiddlewareAPI } from '../../types';
import { push } from '../actions';
import * as navigation from '../selectors';
import { getQueryForParam } from '../utils';

export const openModal = (modalUrlName: string) => (services: MiddlewareAPI & AppServices) => () => {
  const state = services.getState();
  const existingQuery = navigation.query(state);
  const match = navigation.match(state);

  if (match) {
    services.dispatch(push(match, {
      search: getQueryForParam(modalQueryParameterName, modalUrlName, existingQuery),
    }));
  }
};
