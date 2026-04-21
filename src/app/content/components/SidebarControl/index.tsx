import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toolbarIconColor } from '../constants';
import * as actions from '../../actions';
import { TimesIcon } from '../Toolbar/styled';
import { InnerProps } from './types';
import { CloseButton } from './Buttons';
import { TOCControl, lockTocControlState, withMobileResponsiveTocControl } from './TOCControl';
import './SidebarControl.css';

export const CloseToCAndMobileMenuButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  return (
    <button
      {...props}
      className="sidebar-control-close-toc-mobile-button"
      onClick={() => {
        dispatch(actions.closeMobileMenu());
        dispatch(actions.resetToc());
      }}
      aria-label={intl.formatMessage({ id: 'i18n:toolbar:mobile-menu:close'})}
      style={{
        '--sidebar-control-icon-color-base': toolbarIconColor.base,
        '--sidebar-control-icon-color-darker': toolbarIconColor.darker,
      } as React.CSSProperties}
    >
      <TimesIcon />
    </button>
  );
};

export const CloseTOC = ({ message, children, ...props}: React.PropsWithChildren<InnerProps>) =>
  <CloseButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    {children}
  </CloseButton>;

export const TOCControlButton = withMobileResponsiveTocControl(TOCControl);

export const TOCCloseButton = lockTocControlState(true, CloseTOC);

export const TOCOpenButton = lockTocControlState(false, TOCControl);

export const TOCBackButton: React.FC<Omit<InnerProps, 'isOpen' | 'message' | 'onClick'>> = (props) => {
  const Component = TOCCloseButton;
  return <div className="sidebar-control-toc-back-button"><Component {...props} /></div>;
};

export const StyledOpenTOCControl: React.FC<Omit<InnerProps, 'isOpen' | 'message' | 'onClick'>> = (props) => {
  return <div className="sidebar-control-styled-open-toc"><TOCOpenButton {...props} /></div>;
};
