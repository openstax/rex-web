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
import { closeStudyGuides } from '../actions';
import { studyGuidesOpen } from '../selectors';
import ShowStudyGuides from './ShowStudyGuides';

// tslint:disable-next-line: variable-name
const StudyguidesPopUp = () => {
  const dispatch = useDispatch();

  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenCloseSG = useAnalyticsEvent('openCloseStudyGuides');
  const isStudyGuidesOpen = useSelector(studyGuidesOpen) || false;
  const bookTheme = useSelector(bookThemeSelector);

  const closeAndTrack = () => {
    dispatch(closeStudyGuides());
    trackOpenCloseSG('esc');
  };

  const closeStudyGuidesPopUp = () => {
    dispatch(closeStudyGuides());
  };

  useOnEsc(popUpRef, isStudyGuidesOpen, closeAndTrack);

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && isStudyGuidesOpen) {
      popUp.focus();
    }
  }, [isStudyGuidesOpen]);

  return isStudyGuidesOpen ? (
    <PopupWrapper>
      <ScrollLock
        overlay={true}
        mobileOnly={false}
        zIndex={theme.zIndex.highlightSummaryPopup}
        onClick={() => {
          closeStudyGuidesPopUp();
          trackOpenCloseSG('overlay');
        }}
      />
      <Modal
        ref={popUpRef}
        tabIndex='-1'
        data-testid='studyguides-popup-wrapper'
      >
        <Header colorSchema={bookTheme}>
          <FormattedMessage id='i18n:toolbar:studyguides:popup:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
          <FormattedMessage id='i18n:toolbar:studyguides:popup:close-button:aria-label'>
            {(msg: string) => (
              <CloseIconWrapper
                data-testid='close-studyguides-popup'
                aria-label={msg}
                onClick={() => {
                  closeStudyGuidesPopUp();
                  trackOpenCloseSG('button');
                }}
              >
                <CloseIcon colorSchema={bookTheme} />
              </CloseIconWrapper>
            )}
          </FormattedMessage>
        </Header>
        <ShowStudyGuides />
      </Modal>
    </PopupWrapper>
  ) : null;
};

export default StudyguidesPopUp;
