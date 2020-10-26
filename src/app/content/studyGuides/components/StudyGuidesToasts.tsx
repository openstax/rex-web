import { connect } from 'react-redux';
import { groupedToastNotifications } from '../../../notifications/selectors';
import { AppState } from '../../../types';
import ToastNotifications from '../../components/popUp/ToastNotifications';

export default connect((state: AppState) => ({
  toasts: groupedToastNotifications(state).studyGuides,
}))(ToastNotifications);
