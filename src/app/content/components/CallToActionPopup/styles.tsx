import React from 'react';
import styled, { css, keyframes } from 'styled-components';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import Button from '../../../components/Button';
import { PlainButton } from '../../../components/Button';
import { textRegularStyle } from '../../../components/Typography';
import { textStyle } from '../../../components/Typography/base';
import theme from '../../../theme';
import bottomLayer from './assets/bottom-layer.svg';
import ctaGraphic from './assets/desktop-mobile-graphic.svg';
import middleLayer from './assets/middle-layer.svg';
import topLayer from './assets/top-layer.svg';

const slideIn = keyframes`
  0% {
    bottom: -100%;
  }

  100% {
    bottom: 0;
  }
`;

const slideInAnimation = css`
  animation: ${800}ms ${slideIn} ease-out;
`;

// tslint:disable-next-line: variable-name
export const CTAWrapper = styled.div`
  height: 34.8rem;
  position: fixed;
  pointer-events: none;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: ${theme.zIndex.ctaPopup};
  ${slideInAnimation}
  ${theme.breakpoints.mobile(css`
    display: none;
  `)}
`;

// tslint:disable-next-line: variable-name
export const CTAContent = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
`;

// tslint:disable-next-line: variable-name
export const CTAText = styled.div`
  pointer-events: auto;
`;

// tslint:disable-next-line: variable-name
export const CTAHeading = styled.h2`
  ${textStyle}
  font-size: 3.6rem;
  line-height: 4rem;
  letter-spacing: -0.14rem;
  color: ${theme.color.text.white};
  margin: 0;
  max-width: 50rem;
  overflow: hidden;
`;

// tslint:disable-next-line: variable-name
export const CTAParagraph = styled.p`
  ${textStyle}
  font-size: 1.8rem;
  line-height: 3rem;
  margin: 1rem 0;
  color: ${theme.color.text.white};
  max-width: 57rem;
`;

// tslint:disable-next-line: variable-name
export const CTAButtons = styled.div`
  display: flex;
  align-items: center;

  ${Button} {
    width: 17rem;
  }
`;

// tslint:disable-next-line: variable-name
export const CTATextLink = styled.span`
  ${textRegularStyle}
  color: ${theme.color.text.white};
  margin-left: 1.5rem;

  a {
    color: ${theme.color.text.white};
    text-decoration: underline;
    margin-left: 0.5rem;
  }
`;

// tslint:disable-next-line: variable-name
export const CTACloseButton = styled(PlainButton)`
  pointer-events: auto;
  position: absolute;
  top: 11rem;
  right: 1rem;
  min-width: auto;
  padding: 2rem;
  z-index: 1;
`;

// tslint:disable-next-line: variable-name
export const CTACloseIcon = styled(Times)`
  width: 1.8rem;
  color: ${theme.color.text.white};
`;

// tslint:disable-next-line: variable-name
export const CTAGraphic = styled((props) => <img src={ctaGraphic} alt='' {...props} />)`
  margin-left: 3rem;
`;

// tslint:disable-next-line: variable-name
export const CTATopLayer = styled((props) => <img src={topLayer} alt='' {...props} />)`
  position: absolute;
  height: 7.7rem;
  width: 48.3rem;
  right: 0;
  bottom: 0;
`;

// tslint:disable-next-line: variable-name
export const CTAMiddleLayer = styled((props) => <img src={middleLayer} alt='' {...props} />)`
  position: absolute;
  height: 32.8rem;
  width: 100%;
  right: 0;
  bottom: 0;
  left: 0;
`;

// tslint:disable-next-line: variable-name
export const CTABottomLayer = styled((props) => <img src={bottomLayer} alt='' {...props} />)`
  position: absolute;
  height: 32.8rem;
  width: 100%;
  top: 0;
  left: 0;
  right: 0;
`;
