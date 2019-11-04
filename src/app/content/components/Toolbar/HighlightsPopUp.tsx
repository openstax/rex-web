import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { InfoCircle } from 'styled-icons/fa-solid/InfoCircle';
import notLoggedImage1 from '../../../../assets/My_Highlights_page_empty_1.png';
import notLoggedImage2 from '../../../../assets/My_Highlights_page_empty_2.png';
import htmlMessage from '../../../components/htmlMessage';
import { bodyCopyRegularStyle } from '../../../components/Typography';
import { H3, h4Style } from '../../../components/Typography/headings';
import theme from '../../../theme';
import { AppState } from '../../../types';
import * as selectors from '../../selectors';

const popupPadding = 3.2;
const popupBodyPadding = 2.4;

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
`;

// tslint:disable-next-line:variable-name
const PopupBody = styled.div`
  padding: ${popupBodyPadding}rem ${popupPadding}rem;
`;

// tslint:disable-next-line:variable-name
const FirstImage = styled.img`
  ${imageStyles}
  margin-right: ${popupBodyPadding}rem;
`;

// tslint:disable-next-line:variable-name
const SecondImage = styled.img`
  ${imageStyles}
  margin-top: 17.6rem;
`;

// tslint:disable-next-line:variable-name
const ImageWrapper = styled.div`
`;

// tslint:disable-next-line:variable-name
const StickyNote = styled.div`
  height: ${stickyNoteMeasures.height}rem;
  width: ${stickyNoteMeasures.width}rem;
  position: absolute;
  padding: ${stickyNoteMeasures.bulletSize}rem ${popupBodyPadding}rem;
  overflow: hidden;
  box-shadow: 0.1rem 0.1rem 0.4rem 0 rgba(0,0,0,30);
  opacity: ${stickyNoteMeasures.opacity};
`;

// tslint:disable-next-line:variable-name
const StickyNoteBullet = styled.div`
  position: absolute;
  width: ${stickyNoteMeasures.bulletSize}rem;
  height: ${stickyNoteMeasures.bulletSize}rem;
  transform: rotate(45deg);
  z-index: 1;
`;

// tslint:disable-next-line:variable-name
const BlueStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.blue};
  top: ${stickyNoteMeasures.defaultOffset}rem;
  left: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;
`;

// tslint:disable-next-line:variable-name
const BlueStickyNoteBullet = styled(StickyNoteBullet)`
  top: ${stickyNoteMeasures.defaultOffset * 2}rem;
  left: ${stickyNoteMeasures.left}rem;
  transform: rotate(45deg);
  background: ${stickyNoteMeasures.blue};
`;

// tslint:disable-next-line:variable-name
const GreenStickyNote = styled(StickyNote)`
  background: ${stickyNoteMeasures.green};
  bottom: ${stickyNoteMeasures.defaultOffset}rem;
  right: ${stickyNoteMeasures.left + (stickyNoteMeasures.bulletSize / 2)}rem;
`;

// tslint:disable-next-line:variable-name
const GreenStickyNoteBullet = styled(StickyNoteBullet)`
  bottom: ${stickyNoteMeasures.defaultOffset * 2}rem;
  right: ${stickyNoteMeasures.left}rem;
  transform: rotate(45deg);
  background: ${stickyNoteMeasures.green};
`;

// tslint:disable-next-line:variable-name
const StickyNoteUl = styled.ul`
  padding: 0;
  margin: 0;
`;

// tslint:disable-next-line:variable-name
const StickyNoteLi = styled.li`
  ${h4Style}
  padding: 0;
  color: ${theme.color.neutral.base};
  list-style-position: inside;
`;

// tslint:disable-next-line:variable-name
const InfoIcon = styled(InfoCircle)`
  height: 1rem;
  width: 1rem;
  margin-left: 0.5rem;
  vertical-align: baseline;
`;

// tslint:disable-next-line:variable-name
const Tooltip = styled.div`
  position: absolute;
  width: ${stickyNoteMeasures.tooltip.width}rem;
  height: ${stickyNoteMeasures.tooltip.height}rem;
  background: ${theme.color.neutral.base};
  border: solid 0.1rem ${theme.color.neutral.formBorder};
  overflow: visible;
  color: gray;
  font-size: 1.2rem;
  font-weight: 200;
  padding: 1rem;

  ::before {
    content: " ";
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: transparent transparent white transparent;
  }
`;

// tslint:disable-next-line:variable-name
const GridWrapper = styled.div`
  margin: 3.6rem auto 0;
  width: 74.4rem;
`;

// tslint:disable-next-line:variable-name
const ImagesGrid = styled.div`
  display: flex;
  position: relative;
`;

// tslint:disable-next-line:variable-name
const LoginFreeText = styled(H3)`
  width: 100%;
  padding: 0.8rem 0;
`;

// tslint:disable-next-line:variable-name
const LoginTextWrapper = styled.span`
  ${bodyCopyRegularStyle}
`;

// tslint:disable-next-line:variable-name
const LoginText = htmlMessage('i18n:toolbar:highlights:popup:login-text', LoginTextWrapper);

interface Props {
  isMyHighlightsOpen: boolean;
}

class HighlightsPopUp extends Component<Props> {
  public blueNote = () => {
    return ([<BlueStickyNoteBullet/>,
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
    return ([<GreenStickyNoteBullet/>,
      <GreenStickyNote>
        <StickyNoteUl>
          <StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:filter-chapters'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
            <InfoIcon/>
            <Tooltip>
              <FormattedMessage id='i18n:toolbar:highlights:popup:body:tooltip:review'>
                {(msg: Element | string) => msg}
              </FormattedMessage>
            </Tooltip>
          </StickyNoteLi>
          <StickyNoteLi>
            <FormattedMessage id='i18n:toolbar:highlights:popup:body:note:study-guide'>
              {(msg: Element | string) => msg}
            </FormattedMessage>
          </StickyNoteLi>
        </StickyNoteUl>
      </GreenStickyNote>]);
  };

  public render() {
    return (
      this.props.isMyHighlightsOpen ?
        <Modal>
          <Mask>
            <Wrapper>
              <Header>
                <FormattedMessage id='i18n:toolbar:highlights:popup:heading'>
                  {(msg: Element | string) => msg
                  }
                </FormattedMessage>
              </Header>
              <PopupBody>
                <LoginText/>
                <GridWrapper>
                  <LoginFreeText>
                    <FormattedMessage id='i18n:toolbar:highlights:popup:body:highlights-free'>
                      {(msg: Element | string) => msg}
                    </FormattedMessage>
                  </LoginFreeText>
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
              </PopupBody>
            </Wrapper>
          </Mask>
        </Modal>
      : null
    );
  }
}

export default connect((state: AppState) => ({
  isMyHighlightsOpen: selectors.myHighlightsOpen(state),
}))(HighlightsPopUp);
