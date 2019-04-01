import { Event } from '@openstax/types/lib.dom';
import Color from 'color';
import React, { ReactElement } from 'react';
import styled, { css } from 'styled-components';
import { toolbarDesktopHeight } from '../content/components/constants';
import { findFirstScrollableParent } from '../content/utils/domUtils';
import { isHtmlElement } from '../guards';
import theme from '../theme';

// tslint:disable-next-line:variable-name
const MobileScrollLockBodyClassHoC = (
  {children, className}: {className?: string, children: (className?: string) => ReactElement<any>}
) =>
  children(className);

// tslint:disable-next-line:variable-name
const MobileScrollLockBodyClass = styled(MobileScrollLockBodyClassHoC)`
  ${theme.breakpoints.mobile(css`
    overflow: hidden;
  `)}
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

class MobileScrollLock extends React.Component<{bodyClass: string}> {

  public componentDidMount() {
    if (typeof(document) === 'undefined') {
      return;
    }
    const lockClasses = this.props.bodyClass.split(' ');
    document.body.classList.add(...lockClasses);
    document.addEventListener('touchmove', this.blockScroll, {passive: false});
  }

  public componentWillUnmount() {
    if (typeof(document) === 'undefined') {
      return;
    }
    const lockClasses = this.props.bodyClass.split(' ');
    document.body.classList.remove(...lockClasses);
    document.removeEventListener('touchmove', this.blockScroll);
  }

  public render() {
    return <Overlay />;
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

// tslint:disable-next-line:variable-name
const Wrapper: React.SFC = () => <MobileScrollLockBodyClass>
  {(className: string) => <MobileScrollLock bodyClass={className} />}
</MobileScrollLockBodyClass>;

export default Wrapper;
