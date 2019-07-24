import { MouseEvent } from '@openstax/types/lib.dom';
import React from 'react';
import { createGlobalStyle, css } from 'styled-components/macro';
import { isHtmlElement } from '../guards';
import theme from '../theme';
import { assertDocument, assertWindow } from '../utils';

interface ScrollOffsetProps {
  desktopOffset: number;
  mobileOffset: number;
}

// tslint:disable-next-line:variable-name
const GlobalStyle = createGlobalStyle<ScrollOffsetProps>`
  body {
    scroll-padding: ${(props) => props.desktopOffset * 10}px 0 0 0;
    ${theme.breakpoints.mobile(css`
      scroll-padding: ${(props: ScrollOffsetProps) => props.mobileOffset * 10}px 0 0 0;
    `)}
  }
`;

/*
 * everything from here down is only necessary because some browsers (**ahem** safari 11, edge)
 * do not support scroll-padding. safari *claims* to support scroll-padding, but doesn't outside
 * the context of a scroll snap position
 *
 * https://bugs.webkit.org/show_bug.cgi?id=179379
 */

export default class ScrollOffset extends React.Component<ScrollOffsetProps> {

  public getOffset = (window: Window) => -(window.matchMedia(theme.breakpoints.mobileQuery).matches
    ? this.props.mobileOffset * 10
    : this.props.desktopOffset * 10
  );

  public componentDidMount() {
    // hashchange event is unreliable because it is not sent
    // when clicking the same link twice
    assertWindow().addEventListener('click', this.clickHandler);
    assertWindow().addEventListener('resize', this.resizeHandler);

    this.resizeHandler();
    this.scrollForOffset();
    this.scrollOnce();
  }

  public componentWillUnmount() {
    const window = assertWindow();
    window.removeEventListener('click', this.clickHandler);
    window.removeEventListener('resize', this.resizeHandler);
  }

  public render() {
    return <GlobalStyle {...this.props} />;
  }

  private resizeHandler = () => {
    const window = assertWindow();
    const body = window.document.body;

    body.setAttribute('data-scroll-padding', String(this.getOffset(window)));
  };

  private clickHandler = (e: MouseEvent) => {
    if (isHtmlElement(e.target) && e.target.matches('a[href^="#"]')) {
      this.scrollOnce();
    }
  };

  private scrollOnce = () => {
    const handler = () => {
      assertDocument().removeEventListener('scroll', handler);
      this.scrollForOffset();
    };
    assertDocument().addEventListener('scroll', handler);
  };

  private scrollForOffset = () => {
    if (typeof(window) === 'undefined') {
      return;
    }

    const targetId = window.location.hash.slice(1);
    const target = window.document.getElementById(targetId);

    if (!targetId || !target) {
      return;
    }

    if (target.getBoundingClientRect().top < 2) {
      window.scrollBy(0, this.getOffset(window));
    }
  };
}
