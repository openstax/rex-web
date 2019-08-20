import { InfoResults } from '@openstax/open-search-client';
import { Reducer } from 'redux';
import { getType } from 'typesafe-actions';
import { Book } from '../content/types';
import { AnyAction } from '../types';
import * as actions from './actions';

export interface State {
  searchInfo?: InfoResults;
  books: Book[];
  book?: Book;
}
export const initialState: State = {
  books: [],
};

const reducer: Reducer<State, AnyAction> = (state = initialState, action) => {
  switch (action.type) {
    case getType(actions.receiveBooks):
      return {...state, books: action.payload};
    case getType(actions.receiveSearchStatus):
      return {...state, searchInfo: action.payload};
    case getType(actions.receiveBook):
      return {...state, book: action.payload};
    default:
      return state;
  }
};

export default reducer;
