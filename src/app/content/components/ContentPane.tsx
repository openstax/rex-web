import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import ScrollLock from '../../components/ScrollLock';
import theme from '../../theme';
import { Dispatch } from '../../types';
import { remsToEms } from '../../utils';
import { closeToc } from '../actions';
import { State } from '../types';
import {
  contentWrapperMaxWidth,
  mainContentBackground,
  sidebarDesktopWidth,
  sidebarDesktopWithToolbarWidth,
  sidebarTransitionTime,
  verticalNavbarMaxWidth,
} from './constants';
import { isVerticalNavOpenConnector } from './utils/sidebar';

export const contentWrapperWidthBreakpoint = '(max-width: ' + remsToEms(contentWrapperMaxWidth) + 'em)';
export const contentWrapperAndNavWidthBreakpoint =
  '(max-width: ' + remsToEms(contentWrapperMaxWidth + verticalNavbarMaxWidth * 2) + 'em)';

interface Props {
  isDesktopSearchOpen: boolean;
  isVerticalNavOpen: State['tocOpen'];
  onClick: () => void;
}

const ContentPane = ({
  isDesktopSearchOpen,
  isVerticalNavOpen,
  onClick,
  children,
}: React.PropsWithChildren<Props>) => {
  // Determine sidebar closed state classes
  const sidebarClosedMobile = isVerticalNavOpen === null;
  const sidebarClosedDesktop = isDesktopSearchOpen === false && isVerticalNavOpen === false;

  return (
    <div
      className={classNames('content-pane-wrapper', {
        'content-pane-wrapper--sidebar-closed-mobile': sidebarClosedMobile,
        'content-pane-wrapper--sidebar-closed-desktop': sidebarClosedDesktop,
      })}
      data-testid="centered-content-row"
      style={{
        '--content-wrapper-max-width': `${contentWrapperMaxWidth}rem`,
        '--main-content-background': mainContentBackground,
        '--sidebar-desktop-width': `${sidebarDesktopWidth}rem`,
        '--sidebar-desktop-with-toolbar-width': `${sidebarDesktopWithToolbarWidth}rem`,
        '--sidebar-transition-time': `${sidebarTransitionTime}ms`,
      } as React.CSSProperties}
    >
      {isVerticalNavOpen && (
        <ScrollLock
          onClick={onClick}
          mediumScreensOnly={true}
          overlay={true}
          zIndex={theme.zIndex.overlay}
        />
      )}
      {children}
    </div>
  );
};

const dispatchConnector = connect(
  () => ({}),
  (dispatch: Dispatch) => ({
    onClick: () => dispatch(closeToc()),
  })
);

export default isVerticalNavOpenConnector(dispatchConnector(ContentPane));
