import { ActionType } from 'typesafe-actions/dist/types';
import * as actions from './actions';

export type AnyNotification = ActionType<typeof actions>;
export type State =  AnyNotification[];
