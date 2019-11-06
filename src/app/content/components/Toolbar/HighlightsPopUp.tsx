import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { InfoCircle } from 'styled-icons/fa-solid/InfoCircle';
import myHighlightsEmptyImage from '../../../../assets/MHpage-empty-logged-in.png';
import notLoggedImage1 from '../../../../assets/My_Highlights_page_empty_1.png';
import notLoggedImage2 from '../../../../assets/My_Highlights_page_empty_2.png';
import * as authSelect from '../../../auth/selectors';
import { User } from '../../../auth/types';
import htmlMessage from '../../../components/htmlMessage';
import Times from '../../../components/Times';
import { bodyCopyRegularStyle } from '../../../components/Typography';
import { H3, h4Style } from '../../../components/Typography/headings';
import * as selectors from '../../../content/highlights/selectors';
import * as selectNavigation from '../../../navigation/selectors';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { closeMyHighlights } from '../../highlights/actions';
import { toolbarIconColor } from '../constants';

const desktopPopupWidth = 74.4;
const popupPadding = 3.2;
const popupBodyPadding = 2.4;
const myHighlightsImageWidth = 72.8;
const myHighlightsImageHeight = 23.2;

const stickyNoteMeasures = {
  blue: 'rgba(13, 192, 220)',
  bulletSize: 1.6,
  defaultOffset: 3.2,
  green: 'rgba(99, 165, 36)',
  height: 8,
  left: 32.8,
  opacity: '0.85',
  tooltip: {
    height: 8.8,
    width: 18,
  },
  width: 24.8 + 5, /* to allow text to fit in one line with tooltip */
};

const imageStyles = css`
  height: 25.6rem;
  width: 36rem;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0,0,0,20);
`;

// tslint:disable-next-line:variable-name
const Mask = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  background-color: rgba(0, 0, 0, 0.8);
`;

// tslint:disable-next-line:variable-name
const Modal = styled.div`
  top: 0;
  z-index: ${theme.zIndex.modal};
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  position: fixed;
  justify-content: center;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const Wrapper = styled.div`
  z-index: 1;
  width: 100%;
  background: ${theme.color.neutral.base};
  margin: 3rem;
  border-radius: 0.5rem;
`;

// tslint:disable-next-line:variable-name
const Header = styled(H3)`
  background: #002569;
  color: ${theme.color.neutral.base};
  padding: ${popupPadding}rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
const PopupBody = styled.div`
  padding: ${popupBodyPadding}rem ${popupPadding}rem;
  overflow: visible;
  ${theme.breakpoints.mobile(css`
    text-align: center;
    padding: 8rem 3.2rem;
  `)}
`;

// tslint:disable-next-line:variable-name
const FirstImage = styled.img`
  ${imageStyles}
`;

// tslint:disable-next-line:variable-name
const SecondImage = styled.img`
  ${imageStyles}
  margin-top: 17.6rem;
`;

// tslint:disable-next-line:variable-name
const ImageWrapper = styled.div`
  width: ${(desktopPopupWidth - popupBodyPadding) / 2}rem;
`;

const stickyNoteBullet = css`
  content: " ";
  position: absolute;
  width: ${stickyNoteMeasures.bulletSize}rem;
  height: ${stickyNoteMeasures.bulletSize}rem;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0,0,0,30);
  clip-path: polygon(-100% -100%, 100% 0, 0 100%);
  z-index: 1;
`;

// tslint:disable-next-line:variable-name
const StickyNote = styled.div`
  height: ${stickyNoteMeasures.height}rem;
  width: ${stickyNoteMeasures.width}rem;
  position: absolute;
  padding: ${stickyNoteMeasures.bulletSize}rem ${popupBodyPadding}rem;
  overflow: visible;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0,0,0,30);
  opacity: ${stickyNoteMeasures.opacity};
`;

// tslint:disable-next-line:variable-name
const BlueStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.blue};
  top: ${stickyNoteMeasures.defaultOffset}rem;
  left: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;

  ::before {
    ${stickyNoteBullet}
    transform: rotate(-45deg);
    top: ${stickyNoteMeasures.height / 2 - stickyNoteMeasures.bulletSize / 2}rem;
    left: -${stickyNoteMeasures.bulletSize / 2}rem;
    background: ${stickyNoteMeasures.blue};
  }
`;

// tslint:disable-next-line:variable-name
const GreenStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.green};
  bottom: ${stickyNoteMeasures.defaultOffset}rem;
  right: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;

  ::before {
    ${stickyNoteBullet}
    transform: rotate(135deg);
    top: ${stickyNoteMeasures.height / 2 - stickyNoteMeasures.bulletSize / 2}rem;
    right: -${stickyNoteMeasures.bulletSize / 2}rem;
    background: ${stickyNoteMeasures.green};
  }
`;

// tslint:disable-next-line:variable-name
const StickyNoteUl = styled.ul`
  padding: 0;
  overflow: visible;
  margin: 0;
  list-style: none;
`;

// tslint:disable-next-line:variable-name
const StickyNoteLi = styled.li`
  ${h4Style}
  overflow: visible;
  padding: 0;
  color: ${theme.color.neutral.base};

  ::before {
    content: "\\2022";
    padding-right: 0.5rem;
  }
`;

// tslint:disable-next-line:variable-name
const InfoIcon = styled(InfoCircle)`
  height: 1rem;
  width: 1rem;
  margin: 0 0.5rem;
  vertical-align: baseline;
`;

// tslint:disable-next-line:variable-name
const Tooltip = styled.div`
  position: absolute;
  z-index: 2;
  width: ${stickyNoteMeasures.tooltip.width}rem;
  min-height: ${stickyNoteMeasures.tooltip.height}rem;
  background: ${theme.color.neutral.base};
  border: solid 0.1rem ${theme.color.neutral.formBorder};
  top: calc(50% + ${stickyNoteMeasures.bulletSize}rem);
  left: calc(-${stickyNoteMeasures.tooltip.width / 2}rem + 50%);
  overflow: visible;
  color: ${theme.color.text.label};
  font-size: 1.4rem;
  line-height: 2rem;
  font-weight: 200;
  padding: 1rem;
  visibility: hidden;
  box-shadow: 0 0.4rem 1rem 0 rgba(0,0,0,20);
  border-radius: 0.3rem;
  margin-bottom: 3rem;

  ::before {
    content: " ";
    position: absolute;
    left: 50%;
    margin-left: -${stickyNoteMeasures.bulletSize / 4}rem;
    width: ${stickyNoteMeasures.bulletSize / 2}rem;
    height: ${stickyNoteMeasures.bulletSize / 2}rem;
    transform: rotate(45deg);
    top: -${(stickyNoteMeasures.bulletSize / 4) + 0.1}rem;
    background: ${theme.color.neutral.base};
    border-top: solid 0.1rem ${theme.color.neutral.formBorder};
    border-left: solid 0.1rem ${theme.color.neutral.formBorder};
  }
`;

// tslint:disable-next-line:variable-name
const InfoIconWrapper = styled.span`
  position: relative;
  overflow: visible;
  cursor: pointer;

  &:hover ${Tooltip} {
    visibility: visible;
  }
`;

// tslint:disable-next-line:variable-name
const CloseIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  color: ${theme.color.neutral.base};
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.base};
  }
`;

// tslint:disable-next-line:variable-name
const GridWrapper = styled.div`
  margin: 3.6rem auto 0;
  overflow: visible;
  width: ${desktopPopupWidth}rem;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const ImagesGrid = styled.div`
  display: flex;
  position: relative;
  justify-content: space-between;
  overflow: visible;
`;

// tslint:disable-next-line:variable-name
const GeneralText = styled(H3)`
  width: 100%;
  padding: 0.8rem 0;
`;

// tslint:disable-next-line:variable-name
const GeneralTextWrapper = styled.span`
  ${bodyCopyRegularStyle}
`;

// tslint:disable-next-line:variable-name
const LoginText = htmlMessage('i18n:toolbar:highlights:popup:login-text', GeneralTextWrapper);

// tslint:disable-next-line:variable-name
const MyHighlightsWrapper = styled.div`
  margin: 3.6rem auto 0;
  width: ${desktopPopupWidth}rem;
  text-align: center;
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
const GeneralLeftText = styled(GeneralTextWrapper)`
  text-align: left;
  width: 100%;
`;

// tslint:disable-next-line:variable-name
const MyHighlightsImage = styled.img`
  width: ${myHighlightsImageWidth}rem;
  height: ${myHighlightsImageHeight}rem;
  margin-top: ${popupBodyPadding}rem;
`;

interface Props {
  myHighlightsOpen: boolean;
  closeMyHighlights: () => void;
  user?: User;
  loggedOut: boolean;
  currentPath: string;
}

class HighlightsPopUp extends Component<Props> {
  public loginForHighlights = () => {
    return <PopupBody>
      <LoginText values={{loginLink: '/accounts/login?r=' + this.props.currentPath}} />
      <GridWrapper>
        <GeneralText>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:highlights-free'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </GeneralText>
        <ImagesGrid>
          <ImageWrapper>
            <FirstImage src={notLoggedImage1}></FirstImage>
            {this.blueNote()}
          </ImageWrapper>
          <ImageWrapper>
            <SecondImage src={notLoggedImage2}></SecondImage>
            {this.greenNote()}
          </ImageWrapper>
        </ImagesGrid>
      </GridWrapper>
    </PopupBody>;
  };

  public myHighlights = () => {
    return <PopupBody>
      <GeneralLeftText>
        <FormattedMessage id='i18n:toolbar:highlights:popup:heading:no-highlights'>
          {(msg: Element | string) => msg}
        </FormattedMessage>
      </GeneralLeftText>
      <MyHighlightsWrapper>
        <GeneralText>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:add-highlight'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </GeneralText>
        <GeneralTextWrapper>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:use-this-page'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </GeneralTextWrapper>
        <MyHighlightsImage src={myHighlightsEmptyImage}></MyHighlightsImage>
      </MyHighlightsWrapper>
    </PopupBody>;
  };

  public blueNote = () => {
    return ([
    <BlueStickyNote>
      <StickyNoteUl>
        <StickyNoteLi>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:highlight'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </StickyNoteLi>
        <StickyNoteLi>
          <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:add-notes'>
            {(msg: Element | string) => msg}
          </FormattedMessage>
        </StickyNoteLi>
      </StickyNoteUl>
    </BlueStickyNote>]);
  };

  public greenNote = () => {
    return ([
      <GreenStickyNote>
        <StickyNoteUl>
          <StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:filter-chapters'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
            <InfoIconWrapper>
              <InfoIcon/>
              <Tooltip>
                <FormattedMessage id='i18n:toolbar:highlights:popup:body:tooltip:review'>
                  {(msg: Element | string) => msg}
                </FormattedMessage>
              </Tooltip>
            </InfoIconWrapper>
          </StickyNoteLi>
          <StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:study-guide'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </StickyNoteLi>
        </StickyNoteUl>
      </GreenStickyNote>,
    ]);
  };

  public render() {
    return (
      this.props.myHighlightsOpen ?
        <Modal>
          <Mask>
            <Wrapper>
              <Header>
                <FormattedMessage id='i18n:toolbar:highlights:popup:heading'>
                  {(msg: Element | string) => msg}
                </FormattedMessage>
                <CloseIcon onClick={() => this.props.closeMyHighlights()}></CloseIcon>
              </Header>
              {this.props.user ? this.myHighlights() : this.loginForHighlights()}
            </Wrapper>
          </Mask>
        </Modal>
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
