import { push } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { getQueryForParam } from '../../../navigation/utils';
import { AppServices, MiddlewareAPI } from '../../../types';
import { modalQueryParameterName } from '../../constants';
import { getContentParams } from '../../utils/urlUtils';

export const openModal = (modalUrlName: string) => (services: MiddlewareAPI & AppServices) => () => {
  const state = services.getState();
  const existingQuery = navigation.query(state);

  services.dispatch(push(getContentParams(services.getState()), {
    search: getQueryForParam(modalQueryParameterName, modalUrlName, existingQuery),
  }));
};

export const closeModal = (services: MiddlewareAPI & AppServices) => services.history.goBack;
