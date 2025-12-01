import { toolbarIconStyles } from '../Toolbar/iconStyles';
import type { InnerProps } from './types';
import styled, { css } from 'styled-components/macro';
import { toolbarIconColor } from '../constants';
import { toolbarDefaultButton, toolbarDefaultText } from '../Toolbar/styled';
import theme from '../../../theme';

// tslint:disable-next-line:variable-name
export const ButtonText = styled.span`
  ${toolbarDefaultText}
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line: variable-name
export const CloseButton = styled.button`
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  background: none;
  overflow: visible;
  cursor: pointer;
  display: block;

  :hover {
    color: ${toolbarIconColor.darker};
  }

  ${theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;

// tslint:disable-next-line:variable-name
export const OpenButton = styled.button<{isOpen: InnerProps['isOpen'], isActive: boolean }>`
  background: none;
  ${toolbarDefaultButton}
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  overflow: visible;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }

  > svg {
    ${toolbarIconStyles};
  }

  display:
    ${({isOpen, isActive}) => (isOpen !== false && isActive) || (isOpen === false && !isActive)
      ? 'flex'
      : 'none'
  };
  ${(props) => props.isOpen === null && !props.isActive && theme.breakpoints.mobile(css`
    display: flex;
  `)}
  ${(props) => props.isOpen === null && props.isActive && theme.breakpoints.mobile(css`
    display: none;
  `)}

  ${(props) => props.hideMobile && theme.breakpoints.mobileMedium(css`
    display: none;
  `)}
`;
