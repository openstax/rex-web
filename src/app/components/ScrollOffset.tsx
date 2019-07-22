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

const scrollForOffset = (offsets: ScrollOffsetProps) => () => {
  if (typeof(window) === 'undefined') {
    return;
  }

  const targetId = window.location.hash.slice(1);
  const target = window.document.getElementById(targetId);

  if (!targetId || !target) {
    return;
  }

  if (target.getBoundingClientRect().top < 2) {
    window.scrollBy(0, -(window.matchMedia(theme.breakpoints.mobileQuery).matches
      ? offsets.mobileOffset * 10
      : offsets.desktopOffset * 10
    ));
  }
};

const scrollOnce = (listener: () => void) => {
  const handler = () => {
    assertDocument().removeEventListener('scroll', handler);
    listener();
  };
  assertDocument().addEventListener('scroll', handler);
};

export default class ScrollOffset extends React.Component<ScrollOffsetProps> {
  public componentDidMount() {
    const window = assertWindow();
    const listener = scrollForOffset(this.props);

    // hashchange event is unreliable because it does not dispatch
    // when clicking the same link twice
    window.addEventListener('click', (e) => {
      if (isHtmlElement(e.target) && e.target.matches('a[href^="#"]')) {
        scrollOnce(listener);
      }
    });

    listener();
  }

  public render() {
    return <GlobalStyle {...this.props} />;
  }
}
