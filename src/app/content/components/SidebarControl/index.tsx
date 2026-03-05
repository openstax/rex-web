import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { textRegularSize } from '../../../components/Typography';
import theme from '../../../theme';
import * as actions from '../../actions';
import { PlainButton, TimesIcon } from '../Toolbar/styled';
import { InnerProps } from './types';
import { CloseButton, ButtonText } from './Buttons';
import { TOCControl, lockTocControlState, mobileResponsiveTocControl } from './TOCControl';

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


export const TOCControlButton = mobileResponsiveTocControl(TOCControl);

export const TOCCloseButton = (lockTocControlState(true, CloseTOC));

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
