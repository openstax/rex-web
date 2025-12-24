import React, { HTMLAttributes } from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components/macro';
import { sidebarTransitionTime, topbarDesktopHeight } from '../content/components/constants';
import { disablePrint } from '../content/components/utils/disablePrint';
import { useDisableContentTabbing } from '../reactUtils';
import theme from '../theme';
import OnScroll, { OnTouchMoveCallback } from './OnScroll';

const ScrollLockBodyClass = createGlobalStyle`
  body.body {
    ${(props: {mediumScreensOnly?: boolean}) => props.mediumScreensOnly && css`
      ${theme.breakpoints.mobile(css`
        @media print {
          #root {
            display: none;
          }
        }

        overflow: hidden;
      `)}
    `}

    ${(props: {mediumScreensOnly?: boolean}) => !props.mediumScreensOnly && css`
      @media print {
        #root {
          display: none;
        }
      }

      overflow: hidden;
    `}
  }

  @media print {
    body.body {
      overflow: visible;
    }
  }
`;

const fadeIn = keyframes`
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
`;

interface OverlayProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  mediumScreensOnly?: boolean;
  zIndex?: number;
}

export const Overlay = styled(({ mediumScreensOnly, zIndex, ...props}: OverlayProps) => {
  useDisableContentTabbing(mediumScreensOnly ? false : true);
  return <div {...props} />;
})`
  animation: ${sidebarTransitionTime}ms ${fadeIn} ease-out;
  background-color: rgba(0, 0, 0, 0.8);
  ${(props: {zIndex?: number}) => props.zIndex && css`
    z-index: ${props.zIndex};
  `}
  position: absolute;
  content: "";
  top: -${topbarDesktopHeight}rem;
  bottom: 0;
  left: 0;
  right: 0;
  ${(props: {mediumScreensOnly?: boolean}) => props.mediumScreensOnly && css`
    display: none;

    ${theme.breakpoints.mobile(css`
      display: block;
    `)}

    ${theme.breakpoints.mobileMedium(css`
      display: none;
    `)}
  `}

  ${disablePrint}
`;

interface Props {
  onClick?: () => void;
  overlay?: boolean;
  mediumScreensOnly?: boolean | undefined;
  zIndex?: number | undefined;
}

export default class ScrollLock extends React.Component<Props> {

  public render() {
    return <OnScroll onTouchMove={this.blockScroll}>
      <ScrollLockBodyClass mediumScreensOnly={this.props.mediumScreensOnly}/>
      {this.props.overlay !== false && <Overlay
        data-testid='scroll-lock-overlay'
        onClick={this.props.onClick}
        mediumScreensOnly={this.props.mediumScreensOnly}
        zIndex={this.props.zIndex}
      />}
    </OnScroll>;
  }

  private blockScroll: OnTouchMoveCallback = (element, e) => {
    if (
      typeof(window) !== 'undefined'
      && window.matchMedia(theme.breakpoints.mobileQuery).matches
      && element === window
    ) {
      e.preventDefault();
    }
  };
}
