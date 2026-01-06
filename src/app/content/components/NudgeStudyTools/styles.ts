import styled, { css } from 'styled-components/macro';
import { Times } from 'styled-icons/fa-solid/Times';
import { PlainButton } from '../../../components/Button';
import htmlMessage from '../../../components/htmlMessage';
import theme from '../../../theme';
import { remsToPx } from '../../../utils';
import { arrowDesktopHeight, closeButtonMobileMargin, closeButtonSize, contentWidth } from './constants';

export const NudgeWrapper = styled.div`
  display: contents;
`;

export const NudgeContentWrapper = styled.div`
  position: fixed;
  width: ${contentWidth};
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  outline: none;
  ${(props: { top: number, left: number }) => `
    top: ${props.top}px;
    left: ${props.left}px;
  `}
  ${theme.breakpoints.mobileMedium(css`
    left: auto;
    width: 100%;
    padding: 0 1.6rem;
  `)}
`;

export const NudgeContent = styled.div`
  position: relative;
`;

const NudgeHeadingStyles = styled.h2`
  font-size: 3.6rem;
  line-height: 1.1;
  letter-spacing: -1.4px;
  margin: 0 0 1.6rem 0;
  color: ${theme.color.text.white};
  overflow: hidden;

  strong {
    color: ${theme.color.primary.yellow.base};
    font-weight: 600;
    white-space: nowrap;
  }

  ${theme.breakpoints.mobileMedium(css`
    font-size: 2.4rem;
  `)}
`;

export const NudgeHeading = htmlMessage('i18n:nudge:study-tools:heading', NudgeHeadingStyles);

export const NudgeTextStyles = styled.div`
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -1px;
  color: ${theme.color.text.white};
  max-width: 690px;
  overflow: hidden;
  ${theme.breakpoints.mobileMedium(css`
    max-width: 100%;
    font-size: 1.6rem;
    line-height: 1.4;
  `)}
`;

export const NudgeArrow = styled.img`
  position: fixed;
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  display: block;
  height: ${arrowDesktopHeight}rem;
  ${(props: { top: number, left: number }) => `
    top: ${props.top}px;
    left: ${props.left}px;
  `}
`;

export const NudgeCloseIcon = styled(Times)`
  width: 1.1rem;
  color: ${theme.color.text.white};
`;

export const NudgeCloseButton = styled(PlainButton)`
  position: fixed;
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  ${(props: { top: number, left: number }) => `
    top: ${props.top}px;
    left: ${props.left}px;
  `}
  width: ${remsToPx(closeButtonSize)}px;
  height: ${remsToPx(closeButtonSize)}px;
  padding: 1rem;
  border-radius: 50%;
  border: 1px solid ${theme.color.white};
  display: flex;
  align-items: center;
  justify-content: center;

  ${theme.breakpoints.mobile(css`
    left: auto;
    top: ${remsToPx(closeButtonMobileMargin)}px;
    right: ${remsToPx(closeButtonMobileMargin)}px;
  `)}
`;

interface NudgeSpotlightPlacement {
  top: number;
  left: number;
  height: number;
  width: number;
}

export const NudgeBackground = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: ${theme.zIndex.nudgeOverlay};
  pointer-events: none;

  display: grid;
  ${(props: NudgeSpotlightPlacement) => `
    grid-template: ${props.top}px ${props.height}px 1fr / ${props.left}px ${props.width}px 1fr;
    grid-template-areas:
      'top       top       top'
      'left   spotlight   right'
      'bottom   bottom   bottom';
  `}
`;

interface ClickBlockerProps {
  area: 'top' | 'right' | 'bottom' | 'left';
}

export const ClickBlocker = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: all;
  background-color: ${theme.color.black};
  opacity: 0.9;

  grid-area: ${({area}: ClickBlockerProps) => area};
`;

export const NudgeElementTarget = styled.div`
  display: contents;
`;
