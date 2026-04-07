/**
 * Legacy styled-components exports for backward compatibility.
 *
 * This file provides styled-components css fragments and components that are still
 * used by other parts of the codebase. These exports allow consumers to continue
 * using the old API while the Toolbar component itself has been migrated to plain CSS.
 *
 * Files that import from this module:
 * - Topbar/styled.tsx (barPadding, buttonMinWidth, PlainButton)
 * - popUp/PrintButton.ts (PrintOptions)
 * - TableOfContents/index.tsx (LeftArrow, TimesIcon)
 * - SidebarControl/Buttons.tsx (toolbarDefaultButton, toolbarDefaultText)
 * - SidebarControl/index.tsx (PlainButton, TimesIcon)
 *
 * NOTE: This file should be removed in a future phase when all consumers
 * have been migrated to use plain CSS or alternative patterns.
 */

import React from 'react';
import styled, { css } from 'styled-components/macro';
import { maxNavWidth } from '../../../components/NavBar/styled';
import Times from '../../../components/Times';
import {
  textRegularSize,
} from '../../../components/Typography';
import theme from '../../../theme';
import { toolbarIconColor } from '../constants';
import { toolbarIconStyles } from './iconStyles';
import { ChevronLeftIcon } from './styled';

// CSS fragments for styling other components
export const toolbarDefaultText = css`
  font-weight: 600;
  font-size: 1.2rem;
  line-height: 1.5rem;
  ${theme.breakpoints.mobileMedium(css`
    ${textRegularSize};
    margin-left: 1.2rem;
  `)}
`;

export const barPadding = css`
  max-width: ${maxNavWidth}rem;
  margin: 0 auto;
  width: calc(100% - ${theme.padding.page.desktop}rem * 2);
  ${theme.breakpoints.mobile(css`
    width: calc(100% - ${theme.padding.page.mobile}rem * 2);
  `)}
`;

export const toolbarDefaultButton = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 77px;
  ${(props: { isActive: boolean }) => props.isActive && `
    background-color: rgba(0,0,0,0.1);
  `}
  ${theme.breakpoints.mobileMedium(css`
    flex-direction: row;
    justify-content: start;
    min-height: unset;
    margin-top: 25px;
    background: none;
  `)}
`;

// buttonMinWidth constant
export const buttonMinWidth = 4.8;

// Styled components still used by other components
export const PlainButton = styled.button`
  cursor: pointer;
  border: none;
  padding: 0;
  background: none;
  align-items: center;
  color: ${toolbarIconColor.base};
  height: 100%;
  min-width: ${buttonMinWidth}rem;

  :hover,
  :focus {
    color: ${toolbarIconColor.darker};
  }
`;

export const PrintOptions = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

export const TimesIcon = styled((props) => <Times {...props} aria-hidden='true' focusable='false' />)`
  ${toolbarIconStyles};
  vertical-align: middle;
  color: ${toolbarIconColor.base};

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

export const LeftArrow = styled(ChevronLeftIcon)`
  width: 4rem;
  height: 4rem;
  color: ${toolbarIconColor.base};
  margin: 0 -1rem;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;
