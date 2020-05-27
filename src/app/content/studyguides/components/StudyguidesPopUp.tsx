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
import { closeMyHighlights } from '../../highlights/actions';
import { PopupWrapper } from '../../highlights/components/HighlightStyles';
import { CloseIcon, CloseIconWrapper, Header, Modal } from '../../styles/PopupStyles';

interface Props {
  studyguidesOpen: boolean;
  closeStudyguides: () => void;
  user?: User;
  loggedOut: boolean;
}

// tslint:disable-next-line: variable-name
const StudyguidesPopUp = ({ ...props }: Props) => {
  const popUpRef = React.useRef<HTMLElement>(null);
  const trackOpenCloseSG = useAnalyticsEvent('openCloseSG');

  const closeAndTrack = () => {
    props.closeStudyguides();
    trackOpenCloseSG('esc');
  };

  useOnEsc(popUpRef, props.studyguidesOpen, closeAndTrack);

  React.useEffect(() => {
    const popUp = popUpRef.current;

    if (popUp && props.studyguidesOpen) {
      popUp.focus();
    }
  }, [props.studyguidesOpen]);

  return props.studyguidesOpen ? (
    <PopupWrapper>
      <ScrollLock
        overlay={true}
        mobileOnly={false}
        zIndex={theme.zIndex.highlightSummaryPopup}
        onClick={() => { props.closeStudyguides(); trackOpenCloseSG('overlay'); }}
      />
      <Modal
        ref={popUpRef}
        tabIndex='-1'
        data-testid='studyguides-popup-wrapper'
      >
        <Header>
          <FormattedMessage id='i18n:toolbar:highlights:popup:heading'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
          <FormattedMessage id='i18n:toolbar:highlights:popup:close-button:aria-label'>
            {(msg: string) => (
              <CloseIconWrapper
               data-testid='close-highlights-popup'
               aria-label={msg}
               onClick={() => {
                 props.closeStudyguides();
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
    user: authSelect.user(state),
  }),
  (dispatch: Dispatch) => ({
    closeMyHighlights: () => dispatch(closeMyHighlights()),
  })
)(StudyguidesPopUp);
