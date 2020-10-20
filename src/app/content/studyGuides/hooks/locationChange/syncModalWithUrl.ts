import { locationChange } from '../../../../navigation/actions';
import { getParamFromQuery } from '../../../../navigation/utils';
import { ActionHookBody } from '../../../../types';
import { actionHook } from '../../../../utils';
import { modalQueryParameterName } from '../../../constants';
import { openStudyGuides } from '../../actions';
import { modalUrlName } from '../../constants';

const hookBody: ActionHookBody<typeof locationChange> = ({
  dispatch,
}) => async(action) => {
  if (
     action.payload.action !== 'POP'
    || getParamFromQuery(action.payload.location.search, modalQueryParameterName) !== modalUrlName) {
    return;
  }

  dispatch(openStudyGuides());
};

export const syncModalWithUrlHook = actionHook(locationChange, hookBody);
