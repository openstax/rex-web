import styled, { css } from 'styled-components/macro';
import { Times } from 'styled-icons/fa-solid/Times/Times';
import { PlainButton } from '../../../components/Button';
import htmlMessage from '../../../components/htmlMessage';
import theme from '../../../theme';
import { remsToPx } from '../../../utils';
import { arrowDesktopHeight, arrowMobileHeight, closeButtonMobileMargin } from './constants';

// tslint:disable-next-line: variable-name
export const NudgeWrapper = styled.div`
  display: contents;
`;

// tslint:disable-next-line: variable-name
export const NudgeContentWrapper = styled.div`
  position: fixed;
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  outline: none;
  ${(props: { top: number, right: number }) => `
    top: ${props.top}px;
    right: ${props.right}px;
  `}
  ${theme.breakpoints.mobile(css`
    right: auto;
    width: 100%;
    text-align: center;
    padding: 0 2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeContent = styled.div`
  position: relative;
`;

// tslint:disable-next-line: variable-name
const NudgeHeadingStyles = styled.h2`
  font-size: 3.6rem;
  line-height: 1.1;
  letter-spacing: -1.4px;
  margin: 0 0 1.7rem 0;
  color: ${theme.color.text.white};
  overflow: hidden;

  strong {
    color: ${theme.color.primary.yellow.base};
    font-weight: 600;
    white-space: nowrap;
  }

  ${theme.breakpoints.mobile(css`
    font-size: 2.4rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeHeading = htmlMessage('i18n:nudge:study-tools:heading', NudgeHeadingStyles);

// tslint:disable-next-line: variable-name
export const NudgeTextStyles = styled.div`
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.1;
  letter-spacing: -1px;
  color: ${theme.color.text.white};
  max-width: 690px;
  overflow: hidden;
  ${theme.breakpoints.mobile(css`
    max-width: 100%;
    font-size: 1.6rem;
    line-height: 1.4;
    padding: 0 2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeArrow = styled.img`
  position: fixed;
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  display: block;
  height: ${arrowDesktopHeight}rem;
  ${(props: { top: number, left: number }) => `
    top: ${props.top}px;
    left: ${props.left}px;
  `}
  ${theme.breakpoints.mobile(css`
    height: ${arrowMobileHeight}rem;
  `)}
`;

// tslint:disable-next-line: variable-name
export const NudgeCloseIcon = styled(Times)`
  width: 1.1rem;
  color: ${theme.color.text.white};
`;

// tslint:disable-next-line: variable-name
export const NudgeCloseButton = styled(PlainButton)`
  position: fixed;
  z-index: ${theme.zIndex.nudgeOverlay + 1};
  ${(props: { top: number, left: number }) => `
    top: ${props.top}px;
    left: ${props.left}px;
  `}
  width: 4rem;
  height: 4rem;
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

// tslint:disable-next-line: variable-name
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

// tslint:disable-next-line: variable-name
export const ClickBlocker = styled.div`
  width: 100%;
  height: 100%;
  pointer-events: all;
  background-color: ${theme.color.black};
  opacity: 0.9;

  grid-area: ${({area}: ClickBlockerProps) => area};
`;
