import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { toolbarIconColor } from '../constants';
import { toolbarIconStyles } from '../Toolbar/iconStyles';
import { toolbarDefaultButton, toolbarDefaultText } from '../Toolbar/styled';
import type { InnerProps } from './types';

export const ButtonText = styled.span`
  ${toolbarDefaultText}
  margin: 0;
  padding: 0;
`;

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

export const OpenButton = styled.button<{isOpen: InnerProps['isOpen'] }>`
  background: none;
  ${toolbarDefaultButton}
  color: ${toolbarIconColor.base};
  display: flex;
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
`;
