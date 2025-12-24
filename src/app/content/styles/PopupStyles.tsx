import React from 'react';
import styled, { css } from 'styled-components/macro';
import Times from '../../../../src/app/components/Times';
import { PlainButton } from '../../components/Button';
import { h3Style } from '../../components/Typography/headings';
import theme from '../../theme';
import { contentWrapperMaxWidth } from '../components/constants';
import { applyBookTextColor } from '../components/utils/applyBookTextColor';
import { disablePrint } from '../components/utils/disablePrint';
import { BookWithOSWebData } from '../types';
import {
  headerHeight, mobileMarginSides,
  mobileMarginTopBottom,
  mobilePaddingSides, popupBodyPadding, popupHeaderZIndex, popupPadding, topBottomMargin
} from './PopupConstants';

export * from './PopupConstants';

const swapColors = ({colorSchema}: {colorSchema: BookWithOSWebData['theme']}) => {
  const color = theme.color.primary[colorSchema];
  return css`
    color: ${color.foreground};

    &:hover {
      color: ${color.foregroundHover};
    }
  `;
};

export const PopupWrapper = styled.div`
  display: flex;
  justify-content: center;

  @media print {
    display: block;

    & ~ div {
      display: none;
    }
  }
`;

export const Header = styled.div`
  ${h3Style}
  ${disablePrint}
  ${applyBookTextColor}
  background: ${({colorSchema}: {colorSchema: BookWithOSWebData['theme']}) => theme.color.primary[colorSchema].base};
  padding: ${popupPadding}rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${headerHeight}rem;
  overflow: hidden;
  z-index: ${popupHeaderZIndex};
  ${theme.breakpoints.mobile(css`
    padding: ${mobilePaddingSides}rem;
  `)}

  h1 {
    font-size: inherit;
    letter-spacing: inherit;
  }
`;

export const PopupBody = styled.div`
  -webkit-overflow-scrolling: touch;
  height: calc(100% - ${headerHeight}rem);
  background: ${theme.color.neutral.base};
  z-index: ${popupHeaderZIndex - 1};
  overflow: auto;
  ${theme.breakpoints.mobile(css`
    text-align: center;
    padding: 8rem 3.2rem;
  `)}

  @media print {
    height: max-content;
    overflow: auto;
  }
`;

export const Modal = styled.div`
  top: 0;
  z-index: ${theme.zIndex.highlightSummaryPopup};
  position: fixed;
  background: ${theme.color.neutral.base};
  border-radius: 0.5rem;
  height: calc(100% - ${topBottomMargin}rem);
  outline: none;
  overflow: hidden;
  margin: ${headerHeight}rem auto ${popupBodyPadding}rem;
  max-width: ${contentWrapperMaxWidth}rem;
  width: calc(100% - ${popupBodyPadding}rem * 2);
  ${theme.breakpoints.mobile(css`
    margin: 2rem 0;
    width: calc(100% - ${mobileMarginSides * 2}rem);
    height: calc(100% - ${mobileMarginTopBottom * 2}rem);
  `)}

  @media print {
    position: relative;
    width: 100%;
    margin: 0;
    border-radius: 0;
  }
`;

export const CloseIconWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const CloseIcon = styled(({colorSchema: _, ...props}) =>
  <Times {...props} aria-hidden='true' focusable='true' />)`
    ${swapColors}
    cursor: pointer;
    ${disablePrint}
  `;
