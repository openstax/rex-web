import { MiddlewareAPI } from '../../../../types';
import { closeConfirmationModal, showConfirmationModal } from '../../actions';

export default (dispatch: MiddlewareAPI['dispatch']): Promise<boolean> => new Promise((resolve) => {
  dispatch(showConfirmationModal({
    callback: (key) => {
      resolve(key === 'confirm');
      dispatch(closeConfirmationModal());
    },
  }));
});
