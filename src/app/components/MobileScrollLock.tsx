import { Event } from '@openstax/types/lib.dom';
import Color from 'color';
import React from 'react';
import styled, { createGlobalStyle, css } from 'styled-components/macro';
import { toolbarDesktopHeight } from '../content/components/constants';
import { findFirstScrollableParent } from '../content/utils/domUtils';
import { isHtmlElement } from '../guards';
import theme from '../theme';

// tslint:disable-next-line:variable-name
const MobileScrollLockBodyClass = createGlobalStyle`
  body {
    ${theme.breakpoints.mobile(css`
      overflow: hidden;
    `)}
  }
`;

// tslint:disable-next-line:variable-name
const Overlay = styled.div`
  background-color: ${Color(theme.color.primary.gray.base).alpha(0.75).string()};
  z-index: 2; /* stay above book content */
  position: absolute;
  content: "";
  top: -${toolbarDesktopHeight}rem;
  bottom: 0;
  left: 0;
  right: 0;
  display: none;
  ${theme.breakpoints.mobile(css`
    display: block;
  `)}
`;

interface Props {
  onClick?: () => void;
}

export default class MobileScrollLock extends React.Component<Props> {

  public componentDidMount() {
    if (typeof(document) === 'undefined') {
      return;
    }
    document.addEventListener('touchmove', this.blockScroll, {passive: false});
  }

  public componentWillUnmount() {
    if (typeof(document) === 'undefined') {
      return;
    }
    document.removeEventListener('touchmove', this.blockScroll);
  }

  public render() {
    return <Overlay onClick={this.props.onClick}><MobileScrollLockBodyClass /></Overlay>;
  }

  private blockScroll = (e: Event) => {
    if (
      typeof(window) !== 'undefined'
      && window.matchMedia(theme.breakpoints.mobileQuery).matches
      && isHtmlElement(e.target)
      && !findFirstScrollableParent(e.target)
    ) {
      e.preventDefault();
    }
  }
}
