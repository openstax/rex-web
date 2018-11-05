import {Reducer} from 'redux';
import {getType, createStandardAction} from 'typesafe-actions';
import PageNotFound from './components/PageNotFound';
import * as navigation from '../navigation';

export interface State {
  code?: number
};

export const actions = {
  pageNotFound: createStandardAction('Errors/pageNotFound')<void>(),
};

export const reducer: Reducer<State, AnyAction> = (state = {}, action) => {
  switch (action.type) {
    case getType(navigation.actions.locationChange):
      return navigation.matchForRoute('NotFound', action.payload.match)
        ? {...state, code: 404}
        : {...state, code: undefined};
    default:
      return state;
  };
}

const path = '/(.*)';

export const routes: Route[] = [
  { name: 'NotFound', path, component: PageNotFound }
];
