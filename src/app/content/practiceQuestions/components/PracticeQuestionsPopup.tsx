import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { assertWindow } from '../../../utils';
import { useModalFocusManagement } from '../../hooks/useModalFocusManagement';
import Modal from '../../components/Modal';
import { bookTheme as bookThemeSelector } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header } from '../../styles/PopupStyles';
import { closePracticeQuestions } from '../actions';
import * as pqSelectors from '../selectors';
import ShowPracticeQuestions from './ShowPracticeQuestions';

const PracticeQuestionsPopup = () => {
  const dispatch = useDispatch();
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenClosePQ = useAnalyticsEvent('openClosePracticeQuestions');
  const isPracticeQuestionsOpen = useSelector(pqSelectors.isPracticeQuestionsOpen);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);
  const bookTheme = useSelector(bookThemeSelector);
  const intl = useIntl();
  const { closeButtonRef } = useModalFocusManagement({ modalId: 'practicequestions', isOpen: isPracticeQuestionsOpen });

  const closeAndTrack = React.useCallback((method: string) => () => {
    if (currentQuestionIndex !== null) {
      const message = intl.formatMessage({ id: 'i18n:practice-questions:popup:warning-before-close' });
      if (!assertWindow().confirm(message)) { return; }
    }

    dispatch(closePracticeQuestions());

    trackOpenClosePQ(method);
  }, [currentQuestionIndex, trackOpenClosePQ, intl, dispatch]);

  useOnEsc(isPracticeQuestionsOpen, closeAndTrack('esc'));

  return isPracticeQuestionsOpen ?
    <Modal
      ref={popUpRef}
      tabIndex={-1}
      data-testid='practice-questions-popup-wrapper'
      scrollLockProps={{
        mediumScreensOnly: false,
        onClick: closeAndTrack('overlay'),
        overlay: true,
        zIndex: theme.zIndex.highlightSummaryPopup,
      }}
    >
      <Header colorSchema={bookTheme}>
        <CloseIconWrapper
          ref={closeButtonRef}
          data-testid='close-practice-questions-popup'
          aria-label={intl.formatMessage({id: 'i18n:practice-questions:popup:close'})}
          data-analytics-label='Click to close Practice Questions modal'
          onClick={closeAndTrack('button')}
        >
          <CloseIcon colorSchema={bookTheme} />
        </CloseIconWrapper>
        <h1 id='modal-title'>
          <FormattedMessage id='i18n:practice-questions:popup:heading' />
        </h1>
      </Header>
      <ShowPracticeQuestions />
    </Modal>
  : null;
};

export default PracticeQuestionsPopup;
