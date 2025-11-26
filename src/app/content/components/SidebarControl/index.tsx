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
import { SearchControl, lockSearchControlState } from './SearchControl';

// tslint:disable-next-line: variable-name
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

// tslint:disable-next-line:variable-name
export const CloseTOC = ({ message, children, ...props}: React.PropsWithChildren<InnerProps>) =>
  <CloseButton
    aria-label={useIntl().formatMessage({ id: message })}
    {...props}
  >
    {children}
  </CloseButton>;


// tslint:disable-next-line: variable-name
export const TOCControlButton = tocConnector(({open, close, isOpen, ...props}: MiddleProps) => {
  return (
    <OpenButton
      {...props}
      data-testid='toc-button'
      aria-expanded={isOpen === true}
      aria-controls='toc-sidebar'
      aria-label={`Click to ${isOpen ? 'close' : 'open'} the Table of Contents`}
      onClick={isOpen ? close : open}
      isOpen={null}
      isActive={Boolean(props.showActivatedState) && isOpen === true}
    >
      <TocIcon />
      <ButtonText>
        {useIntl().formatMessage({ id: 'i18n:toolbar:toc:text' })}
      </ButtonText>
    </OpenButton>
  );
});

// tslint:disable-next-line:variable-name
export const TOCCloseButton = (lockTocControlState(true, CloseTOC));

// tslint:disable-next-line:variable-name
export const TOCBackButton = styled(TOCCloseButton)`
  display: none;
  ${theme.breakpoints.mobileMedium(css`
    display: block;
  `)}
`;

// tslint:disable-next-line: variable-name
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

// tslint:disable-next-line: variable-name
export const OpenSearchControl = lockSearchControlState(false, SearchControl);

// tslint:disable-next-line: variable-name
export const CloseSearchControl = lockSearchControlState(true, SearchControl);
