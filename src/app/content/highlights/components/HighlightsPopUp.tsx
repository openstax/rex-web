import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import notLoggedImage1 from '../../../../assets/My_Highlights_page_empty_1_360x256.png';
import notLoggedImage1Retina from '../../../../assets/My_Highlights_page_empty_1_720x512.png';
import notLoggedImage2 from '../../../../assets/My_Highlights_page_empty_2_360x256.png';
import notLoggedImage2Retina from '../../../../assets/My_Highlights_page_empty_2_720x512.png';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import * as authSelect from '../../../auth/selectors';
import { User } from '../../../auth/types';
import { useOnEsc } from '../../../reactUtils';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import Modal from '../../components/Modal';
import { bookTheme } from '../../selectors';
import { CloseIcon, CloseIconWrapper, Header, PopupBody } from '../../styles/PopupStyles';
import { BookWithOSWebData } from '../../types';
import { closeMyHighlights as closeMyHighlightsAction } from '../actions';
import * as selectors from '../selectors';
import * as Styled from './HighlightStyles';
import ShowMyHighlights from './ShowMyHighlights';
import HighlightsHelpInfo from './SummaryPopup/HighlightsHelpInfo';

const BlueNote = () => <Styled.BlueStickyNote>
  <Styled.StickyNoteBullet />
  <Styled.StickyNoteUl>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:highlight'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.StickyNoteLi>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:add-notes'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.StickyNoteLi>
  </Styled.StickyNoteUl>
</Styled.BlueStickyNote>;

const GreenNote = () => <Styled.GreenStickyNote>
  <Styled.StickyNoteBullet />
  <Styled.StickyNoteUl>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:review'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.StickyNoteLi>
    <Styled.StickyNoteLi>
      <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:filter-chapters'>
        {(msg) => msg}
      </FormattedMessage>
    </Styled.StickyNoteLi>
  </Styled.StickyNoteUl>
</Styled.GreenStickyNote>;

const LoginForHighlights = () => {
  const loginLink = useSelector(authSelect.loginLink);

  return <PopupBody>
    <Styled.LoginText values={{ loginLink }} />
    <Styled.GridWrapper>
      <Styled.GeneralText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:body:highlights-free'>
          {(msg) => msg}
        </FormattedMessage>
      </Styled.GeneralText>
      <Styled.ImagesGrid>
        <Styled.ImageWrapper>
          <Styled.FirstImage src={notLoggedImage1} srcSet={
            `${notLoggedImage1} 1x, ${notLoggedImage1Retina} 2x`
          } />
          <BlueNote />
        </Styled.ImageWrapper>
        <Styled.ImageWrapper>
          <Styled.SecondImage src={notLoggedImage2} srcSet={
            `${notLoggedImage2} 1x, ${notLoggedImage2Retina} 2x`
          } />
          <GreenNote />
        </Styled.ImageWrapper>
      </Styled.ImagesGrid>
    </Styled.GridWrapper>
  </PopupBody>;
};

interface Props {
  myHighlightsOpen: boolean;
  bookTheme: BookWithOSWebData['theme'];
  closeMyHighlights: () => void;
  user?: User;
  loggedOut: boolean;
}

function useCloseAndTrack(closeFn: () => void) {
    const trackOpenCloseMH = useAnalyticsEvent('openCloseMH');

    return React.useCallback((method: string) => () => {
    closeFn();
    trackOpenCloseMH(method);
  }, [closeFn, trackOpenCloseMH]);
}

const HighlightsPopUp = ({ closeMyHighlights, ...props }: Omit<Props, 'myHighlightsOpen'>) => {
  const popUpRef = React.useRef<HTMLElement>(null);
  const intl = useIntl();
  const closeAndTrack = useCloseAndTrack(closeMyHighlights);

  useOnEsc(true, closeAndTrack('esc'));

  React.useEffect(() => popUpRef.current?.focus(), []);

  return <Modal
    ref={popUpRef}
    tabIndex='-1'
    data-testid='highlights-popup-wrapper'
    scrollLockProps={{
      mediumScreensOnly: false,
      onClick: closeAndTrack('overlay'),
      overlay: true,
      zIndex: theme.zIndex.highlightSummaryPopup,
    }}
  >
    <Header colorSchema={props.bookTheme}>
      <h1 id='modal-title'>
        <FormattedMessage id='i18n:toolbar:highlights:popup:heading' />
      </h1>
      <CloseIconWrapper
        data-testid='close-highlights-popup'
        aria-label={intl.formatMessage({id: 'i18n:toolbar:highlights:popup:close-button:aria-label'})}
        data-analytics-label='Close My Highlights'
        onClick={closeAndTrack('button')}
      >
        <CloseIcon colorSchema={props.bookTheme}/>
      </CloseIconWrapper>
    </Header>
    {props.user ? <ShowMyHighlights topElRef={popUpRef} /> : <LoginForHighlights />}
    <HighlightsHelpInfo />
  </Modal>;
};

function MaybeHighlightsPopUp({myHighlightsOpen, ...props}: Props) {
  if (!myHighlightsOpen) {
    return null;
  }

  return <HighlightsPopUp {...props} />;
}

export default connect(
  (state: AppState) => ({
    bookTheme: bookTheme(state),
    loggedOut: authSelect.loggedOut(state),
    myHighlightsOpen: selectors.myHighlightsOpen(state),
    user: authSelect.user(state),
  }),
  (dispatch: Dispatch) => ({
    closeMyHighlights: () => dispatch(closeMyHighlightsAction()),
  })
)(MaybeHighlightsPopUp);
