import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import TocIcon from '../../../../assets/TocIcon';
import { textRegularSize } from '../../../components/Typography';
import theme from '../../../theme';
import * as actions from '../../actions';
import { PlainButton, TimesIcon } from '../Toolbar/styled';
import { InnerProps, MiddleProps } from './types';
import { OpenButton, CloseButton, ButtonText } from './Buttons';
import { TOCControl, tocConnector, lockTocControlState } from './TOCControl';
import { useMatchMobileQuery } from '../../../reactUtils';

export const CloseToCAndMobileMenuButton = styled((props) => {
  const intl = useIntl();
  const dispatch = useDispatch();

  return <PlainButton
    {...props}
    onClick={() => {
      dispatch(actions.closeMobileMenu());
      dispatch(actions.resetToc());
    }}
    aria-label={intl.formatMessage({ id: 'i18n:toolbar:mobile-menu:close'})}
    >
      <TimesIcon />
  </PlainButton>;
})`
  height: 40px;
  position: absolute;
  right: 0;
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;

export const CloseTOC = ({ message, children, ...props}: React.PropsWithChildren<InnerProps>) =>
  <CloseButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    {children}
  </CloseButton>;


export const TOCControlButton = tocConnector(({open, close, ...props}: MiddleProps) => {
  const isMobile = typeof window !== 'undefined' && useMatchMobileQuery();
  const isOpen = props.isOpen === null ? !isMobile : props.isOpen;

  return (
    <OpenButton
      {...props}
      data-testid='toc-button'
      aria-expanded={isOpen === true}
      aria-controls='toc-sidebar'
      aria-label={`Click to ${isOpen ? 'close' : 'open'} the Table of Contents`}
      onClick={isOpen ? close : open}
      isActive={isOpen}
    >
      <TocIcon />
      <ButtonText>
        {useIntl().formatMessage({ id: 'i18n:toolbar:toc:text' })}
      </ButtonText>
    </OpenButton>
  );
});

export const TOCCloseButton = lockTocControlState(true, CloseTOC) as React.ComponentType;

export const TOCBackButton = styled(TOCCloseButton)`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;

export const StyledOpenTOCControl = styled(lockTocControlState(false, TOCControl))`
  display: flex;
  padding: 0;
  min-height: unset;
  flex-direction: row;
  justify-content: start;

  ${ButtonText} {
    ${textRegularSize};
  }
`;
