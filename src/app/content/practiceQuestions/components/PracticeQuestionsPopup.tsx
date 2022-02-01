import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { push } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { assertDefined, assertWindow } from '../../../utils';
import Modal from '../../components/Modal';
import { bookTheme as bookThemeSelector } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header } from '../../styles/PopupStyles';
import * as pqSelectors from '../selectors';
import ShowPracticeQuestions from './ShowPracticeQuestions';

// tslint:disable-next-line: variable-name
const PracticeQuestionsPopup = () => {
  const dispatch = useDispatch();
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenClosePQ = useAnalyticsEvent('openClosePracticeQuestions');
  const isPracticeQuestionsOpen = useSelector(pqSelectors.isPracticeQuestionsOpen);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);
  const bookTheme = useSelector(bookThemeSelector);
  const intl = useIntl();
  const match = useSelector(navigation.match);

  const closeAndTrack = React.useCallback((method: string) => () => {
    if (currentQuestionIndex !== null) {
      const message = intl.formatMessage({ id: 'i18n:practice-questions:popup:warning-before-close' });
      if (!assertWindow().confirm(message)) { return; }
    }

    dispatch(push(assertDefined(match, 'match should be always defined at this step')));

    trackOpenClosePQ(method);
  }, [currentQuestionIndex, trackOpenClosePQ, intl, dispatch, match]);

  useOnEsc(popUpRef, isPracticeQuestionsOpen, closeAndTrack('esc'));

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && isPracticeQuestionsOpen) {
      popUp.focus();
    }
  }, [isPracticeQuestionsOpen]);

  return isPracticeQuestionsOpen ?
    <Modal
      ref={popUpRef}
      tabIndex='-1'
      data-testid='practice-questions-popup-wrapper'
      scrollLockProps={{
        mobileOnly: false,
        onClick: closeAndTrack('overlay'),
        overlay: true,
        zIndex: theme.zIndex.highlightSummaryPopup,
      }}
    >
      <Header colorSchema={bookTheme}>
        <FormattedMessage id='i18n:practice-questions:popup:heading'>
          {(msg) => msg}
        </FormattedMessage>
        <CloseIconWrapper
          data-testid='close-practice-questions-popup'
          aria-label={intl.formatMessage({id: 'i18n:practice-questions:popup:close'})}
          data-analytics-label='Click to close Practice Questions modal'
          onClick={closeAndTrack('button')}
        >
          <CloseIcon colorSchema={bookTheme} />
        </CloseIconWrapper>
      </Header>
      <ShowPracticeQuestions />
    </Modal>
  : null;
};

export default PracticeQuestionsPopup;
