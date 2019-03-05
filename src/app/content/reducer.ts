import omit from 'lodash/fp/omit';
import pick from 'lodash/fp/pick';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { AnyAction } from '../types';
import * as actions from './actions';
import { State } from './types';

export const initialState = {
  loading: {},
  references: [],
  tocOpen: true,
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.openToc):
      return {...state, tocOpen: true};
    case getType(actions.closeToc):
      return {...state, tocOpen: false};
    case getType(actions.requestBook):
      return {...state, loading: {...state.loading, book: action.payload}};
    case getType(actions.receiveBook): {
      const loading = omit('book', state.loading);
      const book = pick([
        'id',
        'shortId',
        'title',
        'version',
        'tree',
        'slug',
        'license',
        'authors',
        'publish_date',
      ], action.payload);
      return {...state, loading, book};
    }
    case getType(actions.requestPage):
      return {...state, loading: {...state.loading, page: action.payload}};
    case getType(actions.receivePage): {
      const loading = omit('page', state.loading);
      const page = pick(['id', 'shortId', 'title', 'version'], action.payload);
      return {...state, loading, page, references: action.payload.references};
    }
    default:
      return state;
  }
};

export default reducer;
