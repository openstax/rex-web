import { modalQueryParameterName } from '../../content/constants';
import { getContentParams } from '../../content/utils/urlUtils';
import { AppServices, MiddlewareAPI } from '../../types';
import { push } from '../actions';
import * as navigation from '../selectors';
import { getQueryForParam } from '../utils';

export const openModal = (modalUrlName: string) => (services: MiddlewareAPI & AppServices) => () => {
  const state = services.getState();
  const existingQuery = navigation.query(state);

  services.dispatch(push(getContentParams(services.getState()), {
    search: getQueryForParam(modalQueryParameterName, modalUrlName, existingQuery),
  }));
};
