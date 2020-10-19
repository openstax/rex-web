import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import ScrollLock from '../../../components/ScrollLock';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { bookTheme as bookThemeSelector } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header, Modal, PopupWrapper } from '../../styles/PopupStyles';
import { closePracticeQuestions } from '../actions';
import { practiceQuestionsOpen } from '../selectors';
import ShowPracticeQuestions from './ShowPracticeQuestions';

// tslint:disable-next-line: variable-name
const PracticeQuestionsPopup = () => {
  const dispatch = useDispatch();
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenClosePQ = useAnalyticsEvent('openClosePracticeQuestions');
  const isPracticeQuestionsOpen = useSelector(practiceQuestionsOpen);
  const bookTheme = useSelector(bookThemeSelector);

  const closeAndTrack = () => {
    dispatch(closePracticeQuestions());
    trackOpenClosePQ('esc');
  };

  const closePracticeQuestionsPopUp = () => {
    dispatch(closePracticeQuestions());
  };

  useOnEsc(popUpRef, isPracticeQuestionsOpen, closeAndTrack);

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && isPracticeQuestionsOpen) {
      popUp.focus();
    }
  }, [isPracticeQuestionsOpen]);

  return isPracticeQuestionsOpen ? (
    <PopupWrapper>
      <ScrollLock
        overlay={true}
        mobileOnly={false}
        zIndex={theme.zIndex.highlightSummaryPopup}
        onClick={() => {
          closePracticeQuestionsPopUp();
          trackOpenClosePQ('overlay');
        }}
      />
      <Modal
        ref={popUpRef}
        tabIndex='-1'
        data-testid='practice-questions-popup-wrapper'
      >
        <Header colorSchema={bookTheme}>
          <FormattedMessage id='i18n:practice-questions:popup:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
          <FormattedMessage id='i18n:practice-questions:popup:close'>
            {(msg: string) => (
              <CloseIconWrapper
                data-testid='close-practice-questions-popup'
                aria-label={msg}
                onClick={() => {
                  closePracticeQuestionsPopUp();
                  trackOpenClosePQ('button');
                }}
              >
                <CloseIcon colorSchema={bookTheme} />
              </CloseIconWrapper>
            )}
          </FormattedMessage>
        </Header>
        <ShowPracticeQuestions />
      </Modal>
    </PopupWrapper>
  ) : null;
};

export default PracticeQuestionsPopup;
