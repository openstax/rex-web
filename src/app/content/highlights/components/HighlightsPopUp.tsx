import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import notLoggedImage1 from '../../../../assets/My_Highlights_page_empty_1.png';
import notLoggedImage2 from '../../../../assets/My_Highlights_page_empty_2.png';
import * as authSelect from '../../../auth/selectors';
import { User } from '../../../auth/types';
import Loader from '../../../components/Loader';
import ScrollLock from '../../../components/ScrollLock';
import { isHtmlElement } from '../../../guards';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { closeMyHighlights } from '../actions';
import * as selectors from '../selectors';
import { HighlightData } from '../types';
import * as Styled from './HighlightStyles';
import ShowMyHighlights from './ShowMyHighlights';

interface Props {
  myHighlightsOpen: boolean;
  closeMyHighlights: () => void;
  user?: User;
  loggedOut: boolean;
  loginLink: string;
  highlights: HighlightData[];
  summaryIsLoading: boolean;
}

class HighlightsPopUp extends Component<Props> {
  public popUp = React.createRef<HTMLElement>();

  public loginForHighlights = () => {
    return (
      <Styled.PopupBody>
        <Styled.LoginText values={{ loginLink: this.props.loginLink }} />
        <Styled.GridWrapper>
          <Styled.GeneralText>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:highlights-free'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.GeneralText>
          <Styled.ImagesGrid>
            <Styled.ImageWrapper>
              <Styled.FirstImage src={notLoggedImage1} />
              {this.blueNote()}
            </Styled.ImageWrapper>
            <Styled.ImageWrapper>
              <Styled.SecondImage src={notLoggedImage2} />
              {this.greenNote()}
            </Styled.ImageWrapper>
          </Styled.ImagesGrid>
        </Styled.GridWrapper>
      </Styled.PopupBody>
    );
  };

  public myHighlights = () => {
    return this.props.highlights.length > 0 ? (
      <ShowMyHighlights />
    ) : (
      <Styled.PopupBody>{this.noHighlights()}</Styled.PopupBody>
    );
  };

  public noHighlights() {
    return (
      <React.Fragment>
        <Styled.GeneralLeftText>
          <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </Styled.GeneralLeftText>
        <Styled.MyHighlightsWrapper>
          <Styled.GeneralText>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.GeneralText>
          <Styled.GeneralTextWrapper>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.GeneralTextWrapper>
          <Styled.MyHighlightsImage src={myHighlightsEmptyImage} />
        </Styled.MyHighlightsWrapper>
      </React.Fragment>
    );
  }

  public blueNote = () => {
    return (
      <Styled.BlueStickyNote>
        <Styled.StickyNoteUl>
          <Styled.StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:highlight'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.StickyNoteLi>
          <Styled.StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:add-notes'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.StickyNoteLi>
        </Styled.StickyNoteUl>
      </Styled.BlueStickyNote>
    );
  };

  public greenNote = () => {
    return (
      <Styled.GreenStickyNote>
        <Styled.StickyNoteUl>
          <Styled.StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:study-guide'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
            <Styled.InfoIconWrapper>
              <Styled.InfoIcon />
              <Styled.Tooltip>
                <FormattedMessage id='i18n:toolbar:highlights:popup:body:tooltip:review'>
                  {(msg: Element | string) => msg}
                </FormattedMessage>
              </Styled.Tooltip>
            </Styled.InfoIconWrapper>
          </Styled.StickyNoteLi>
          <Styled.StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:filter-chapters'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.StickyNoteLi>
        </Styled.StickyNoteUl>
      </Styled.GreenStickyNote>
    );
  };

  public render() {
    return this.props.myHighlightsOpen ?
      <Styled.PopupWrapper>
        <ScrollLock
          overlay={true}
          mobileOnly={false}
          zIndex={theme.zIndex.highlightSummaryPopup}
          onClick={this.props.closeMyHighlights}
        />
        <Styled.Modal
          ref={this.popUp}
          tabIndex='-1'
          data-testid='highlights-popup-wrapper'
        >
          <Styled.Header>
            <FormattedMessage id='i18n:toolbar:highlights:popup:heading'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
            <Styled.CloseIconWrapper onClick={() => this.props.closeMyHighlights()}>
              <Styled.CloseIcon data-testid='close-highlights-popup' />
            </Styled.CloseIconWrapper>
          </Styled.Header>
          {this.props.user && this.props.summaryIsLoading ? (
            <Styled.PopupBody><Loader /></Styled.PopupBody>
          ) : this.props.user ? (
            this.myHighlights()
          ) : (
            this.loginForHighlights()
          )}
        </Styled.Modal>
      </Styled.PopupWrapper>
    : null;
  }

  public componentDidUpdate() {
    const popUp = this.popUp.current;
    if (isHtmlElement(popUp)) {
      popUp.focus();
    }
  }
}

export default connect(
  (state: AppState) => ({
    highlights: selectors.highlights(state),
    loggedOut: authSelect.loggedOut(state),
    loginLink: authSelect.loginLink(state),
    myHighlightsOpen: selectors.myHighlightsOpen(state),
    summaryIsLoading: selectors.summaryIsLoading(state),
    user: authSelect.user(state),
  }),
  (dispatch: Dispatch) => ({
    closeMyHighlights: () => dispatch(closeMyHighlights()),
  })
)(HighlightsPopUp);
