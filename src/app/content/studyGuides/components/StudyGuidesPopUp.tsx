import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { FirstArgumentType } from '../../../types';
import { getOpeningElement, clearOpeningElement } from '../../utils/focusManager';
import Modal from '../../components/Modal';
import { bookTheme as bookThemeSelector } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header } from '../../styles/PopupStyles';
import { closeStudyGuides } from '../actions';
import { studyGuidesOpen } from '../selectors';
import ShowStudyGuides from './ShowStudyGuides';

const StudyguidesPopUp = () => {
  const dispatch = useDispatch();
  const intl = useIntl();

  const popUpRef = React.useRef<HTMLElement>(null);
  const openingElementRef = React.useRef<HTMLElement | null>(null);
  const trackClose = useAnalyticsEvent('closeStudyGuides');
  const isStudyGuidesOpen = useSelector(studyGuidesOpen) || false;
  const bookTheme = useSelector(bookThemeSelector);

  const closeAndTrack = React.useCallback((method: FirstArgumentType<typeof trackClose>) => () => {
    dispatch(closeStudyGuides());
    trackClose(method);
  }, [dispatch, trackClose]);

  useOnEsc(isStudyGuidesOpen, closeAndTrack('esc'));

  React.useLayoutEffect(() => {
    if (isStudyGuidesOpen) {
      openingElementRef.current = getOpeningElement('studyguides');
    } else if (openingElementRef.current) {
      openingElementRef.current.focus();
      clearOpeningElement('studyguides');
      openingElementRef.current = null;
    }
  }, [isStudyGuidesOpen]);

  const closeButtonRef = React.useCallback((element: HTMLElement | null) => {
    if (element) {
      element.focus();
    }
  }, []);

  return isStudyGuidesOpen ?
    <Modal
      ref={popUpRef}
      tabIndex='-1'
      data-testid='studyguides-popup-wrapper'
      scrollLockProps={{
        mediumScreensOnly: false,
        onClick: closeAndTrack('overlay'),
        overlay: true,
        zIndex: theme.zIndex.highlightSummaryPopup,
      }}
    >
      <Header colorSchema={bookTheme}>
        <h1 id='modal-title'>
          <FormattedMessage id='i18n:toolbar:studyguides:popup:heading' />
        </h1>
        <CloseIconWrapper
          ref={closeButtonRef}
          data-testid='close-studyguides-popup'
          aria-label={intl.formatMessage({id: 'i18n:toolbar:studyguides:popup:close-button:aria-label'})}
          data-analytics-label='Close Study Guides'
          onClick={closeAndTrack('button')}
        >
          <CloseIcon colorSchema={bookTheme} />
        </CloseIconWrapper>
      </Header>
      <ShowStudyGuides topElRef={popUpRef} />
    </Modal>
    : null;
};

export default StudyguidesPopUp;
