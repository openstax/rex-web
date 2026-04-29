import React from 'react';
import classNames from 'classnames';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toolbarIconColor } from '../constants';
import * as actions from '../../actions';
import { TimesIcon } from '../Toolbar/styled';
import { InnerProps } from './types';
import { CloseButton } from './Buttons';
import { TOCControl, lockTocControlState, withMobileResponsiveTocControl } from './TOCControl';

export function CloseToCAndMobileMenuButton(
  { className, style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>
) {
  const intl = useIntl();
  const dispatch = useDispatch();

  return (
    <button
      {...props}
      className={classNames('sidebar-control-close-toc-mobile-button', className)}
      onClick={() => {
        dispatch(actions.closeMobileMenu());
        dispatch(actions.resetToc());
      }}
      aria-label={intl.formatMessage({ id: 'i18n:toolbar:mobile-menu:close'})}
      style={{
        '--sidebar-control-icon-color-base': toolbarIconColor.base,
        '--sidebar-control-icon-color-darker': toolbarIconColor.darker,
        ...style,
      } as React.CSSProperties}
    >
      <TimesIcon />
    </button>
  );
}

export function CloseTOC(
  { message, children, onClick, isOpen: _isOpen, isActive: _isActive, ...props }: React.PropsWithChildren<InnerProps>
) {
  return <CloseButton
    aria-label={useIntl().formatMessage({ id: message })}
    onClick={onClick}
    {...props}
  >
    {children}
  </CloseButton>;
}

export const TOCControlButton = withMobileResponsiveTocControl(TOCControl);

export const TOCCloseButton = lockTocControlState(true, CloseTOC);

export const TOCOpenButton = lockTocControlState(false, TOCControl);

export const TOCBackButton: React.FC<Omit<InnerProps, 'isOpen' | 'message' | 'onClick'>> = (props) => {
  const Component = TOCCloseButton;
  return <div className="sidebar-control-toc-back-button"><Component {...props} /></div>;
};

export function StyledOpenTOCControl(props: Omit<InnerProps, 'isOpen' | 'message' | 'onClick'>) {
  return <div className="sidebar-control-styled-open-toc"><TOCOpenButton {...props} /></div>;
}
