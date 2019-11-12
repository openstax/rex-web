import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import myHighlightsEmptyImage from '../../../../../assets/MHpage-empty-logged-in.png';
import notLoggedImage1 from '../../../../../assets/My_Highlights_page_empty_1.png';
import notLoggedImage2 from '../../../../../assets/My_Highlights_page_empty_2.png';
import * as authSelect from '../../../../auth/selectors';
import { User } from '../../../../auth/types';
import * as selectNavigation from '../../../../navigation/selectors';
import { AppState, Dispatch } from '../../../../types';
import { closeMyHighlights } from '../../../highlights/actions';
import * as selectors from '../../../highlights/selectors';
import * as Styled from './HighlightStyles';

interface Props {
  myHighlightsOpen: boolean;
  closeMyHighlights: () => void;
  user?: User;
  loggedOut: boolean;
  currentPath: string;
}

class HighlightsPopUp extends Component<Props> {
  public loginForHighlights = () => {
    return <Styled.PopupBody>
      <Styled.LoginText values={{loginLink: '/accounts/login?r=' + this.props.currentPath}} />
      <Styled.GridWrapper>
        <Styled.GeneralText>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:highlights-free'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </Styled.GeneralText>
        <Styled.ImagesGrid>
          <Styled.ImageWrapper>
            <Styled.FirstImage src={notLoggedImage1}></Styled.FirstImage>
            {this.blueNote()}
          </Styled.ImageWrapper>
          <Styled.ImageWrapper>
            <Styled.SecondImage src={notLoggedImage2}></Styled.SecondImage>
            {this.greenNote()}
          </Styled.ImageWrapper>
        </Styled.ImagesGrid>
      </Styled.GridWrapper>
    </Styled.PopupBody>;
  };

  public myHighlights = () => {
    return <Styled.PopupBody>
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
        <Styled.MyHighlightsImage src={myHighlightsEmptyImage}></Styled.MyHighlightsImage>
      </Styled.MyHighlightsWrapper>
    </Styled.PopupBody>;
  };

  public blueNote = () => {
    return ([
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
    </Styled.BlueStickyNote>]);
  };

  public greenNote = () => {
    return ([
      <Styled.GreenStickyNote>
        <Styled.StickyNoteUl>
          <Styled.StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:filter-chapters'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
            <Styled.InfoIconWrapper>
              <Styled.InfoIcon/>
              <Styled.Tooltip>
                <FormattedMessage id='i18n:toolbar:highlights:popup:body:tooltip:review'>
                  {(msg: Element | string) => msg}
                </FormattedMessage>
              </Styled.Tooltip>
            </Styled.InfoIconWrapper>
          </Styled.StickyNoteLi>
          <Styled.StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:study-guide'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </Styled.StickyNoteLi>
        </Styled.StickyNoteUl>
      </Styled.GreenStickyNote>,
    ]);
  };

  public render() {
    return (
      this.props.myHighlightsOpen ?
        <Styled.Modal>
          <Styled.Mask>
            <Styled.Wrapper>
              <Styled.Header>
                <FormattedMessage id='i18n:toolbar:highlights:popup:heading'>
                  {(msg: Element | string) => msg}
                </FormattedMessage>
                <Styled.CloseIcon data-testid='close-highlights-popup' onClick={() => this.props.closeMyHighlights()}/>
              </Styled.Header>
              {this.props.user ? this.myHighlights() : this.loginForHighlights()}
            </Styled.Wrapper>
          </Styled.Mask>
        </Styled.Modal>
      : null
    );
  }
}

export default connect(
  (state: AppState) => ({
    currentPath: selectNavigation.pathname(state),
    loggedOut: authSelect.loggedOut(state),
    myHighlightsOpen: selectors.myHighlightsOpen(state),
    user: authSelect.user(state),
  }),
  (dispatch: Dispatch) => ({
    closeMyHighlights: () => dispatch(closeMyHighlights()),
  })
)(HighlightsPopUp);
