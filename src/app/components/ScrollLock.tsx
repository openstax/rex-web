import React, { HTMLAttributes } from 'react';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components/macro';
import { sidebarTransitionTime, toolbarDesktopHeight } from '../content/components/constants';
import { disablePrint } from '../content/components/utils/disablePrint';
import { useDisableContentTabbing } from '../reactUtils';
import theme from '../theme';
import OnScroll, { OnTouchMoveCallback } from './OnScroll';

// tslint:disable-next-line:variable-name
const ScrollLockBodyClass = createGlobalStyle`
  body.body {
    ${(props: {mobileOnly?: boolean}) => props.mobileOnly && css`
      ${theme.breakpoints.mobile(css`
        overflow: hidden;
      `)}
    `}

    ${(props: {mobileOnly?: boolean}) => props.mobileOnly === false && css`
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
  mobileOnly?: boolean;
  zIndex?: number;
}

// tslint:disable-next-line:variable-name
export const Overlay = styled(({ mobileOnly, zIndex, ...props}: OverlayProps) => {
  useDisableContentTabbing();
  return <div {...props} />;
})`
  animation: ${sidebarTransitionTime}ms ${fadeIn} ease-out;
  background-color: rgba(0, 0, 0, 0.8);
  ${(props: {zIndex?: number}) => props.zIndex && css`
    z-index: ${props.zIndex};
  `}
  position: absolute;
  content: "";
  top: -${toolbarDesktopHeight}rem;
  bottom: 0;
  left: 0;
  right: 0;
  ${(props: {mobileOnly?: boolean}) => props.mobileOnly && css`
    display: none;

    ${theme.breakpoints.mobile(css`
      display: block;
    `)}
  `}

  ${disablePrint}
`;

interface Props {
  onClick?: () => void;
  overlay?: boolean;
  mobileOnly?: boolean | undefined;
  zIndex?: number | undefined;
}

export default class ScrollLock extends React.Component<Props> {

  public render() {
    return <OnScroll onTouchMove={this.blockScroll}>
      <ScrollLockBodyClass mobileOnly={this.props.mobileOnly}/>
      {this.props.overlay !== false && <Overlay
        data-testid='scroll-lock-overlay'
        onClick={this.props.onClick}
        mobileOnly={this.props.mobileOnly}
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
