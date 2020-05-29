import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import * as authSelect from '../../../auth/selectors';
import { User } from '../../../auth/types';
import ScrollLock from '../../../components/ScrollLock';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { CloseIcon, CloseIconWrapper, Header, Modal, PopupWrapper } from '../../styles/PopupStyles';
import { closeStudyGuides as closeStudyGuidesAction } from '../actions';
import * as selectors from '../selectors';

interface Props {
  studyGuidesOpen: boolean;
  closeStudyGuides: () => void;
  user?: User;
  loggedOut: boolean;
}

// tslint:disable-next-line: variable-name
const StudyguidesPopUp = ({ ...props }: Props) => {
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenCloseSG = useAnalyticsEvent('openCloseStudyGuides');

  const closeAndTrack = () => {
    props.closeStudyGuides();
    trackOpenCloseSG('esc');
  };

  useOnEsc(popUpRef, props.studyGuidesOpen, closeAndTrack);

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && props.studyGuidesOpen) {
      popUp.focus();
    }
  }, [props.studyGuidesOpen]);

  return props.studyGuidesOpen ? (
    <PopupWrapper>
      <ScrollLock
        overlay={true}
        mobileOnly={false}
        zIndex={theme.zIndex.highlightSummaryPopup}
        onClick={() => { props.closeStudyGuides(); trackOpenCloseSG('overlay'); }}
      />
      <Modal
        ref={popUpRef}
        tabIndex='-1'
        data-testid='studyguides-popup-wrapper'
      >
        <Header>
          <FormattedMessage id='i18n:toolbar:studyguides:popup:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
          <FormattedMessage id='i18n:toolbar:studyguides:popup:close-button:aria-label'>
            {(msg: string) => (
              <CloseIconWrapper
               data-testid='close-studyguides-popup'
               aria-label={msg}
               onClick={() => {
                 props.closeStudyGuides();
                 trackOpenCloseSG('button');
               }}
              >
                <CloseIcon />
              </CloseIconWrapper>
            )}
          </FormattedMessage>
        </Header>
      </Modal>
    </PopupWrapper>
  ) : null;
};

export default connect(
  (state: AppState) => ({
    loggedOut: authSelect.loggedOut(state),
    studyGuidesOpen: selectors.studyGuidesOpen(state),
    user: authSelect.user(state),
  }),
  (dispatch: Dispatch) => ({
    closeStudyGuides: () => dispatch(closeStudyGuidesAction()),
  })
)(StudyguidesPopUp);
