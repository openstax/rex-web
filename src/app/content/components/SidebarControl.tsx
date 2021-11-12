import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import styled from 'styled-components/macro';
import TocIcon from '../../../assets/TocIcon';
import { Dispatch } from '../../types';
import * as actions from '../actions';
import { toolbarIconColor } from './constants';
import { toolbarIconStyles } from './Toolbar/iconStyles';
import { toolbarDefaultButton, toolbarDefaultText } from './Toolbar/styled';

interface OpenSidebarProps {
  onClick: () => void;
  className?: string;
  isActive?: boolean;
}
interface CloseSidebarProps {
  onClick: () => void;
  className?: string;
}

// tslint:disable-next-line:variable-name
export const ToCButtonText = styled.span`
  ${toolbarDefaultText}
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const ToCToolbarButton = styled.button`
  background: none;
  ${toolbarDefaultButton}
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0 10px;
  overflow: visible;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }

  > svg {
    ${toolbarIconStyles};
  }
`;

// tslint:disable-next-line: variable-name
const ToCButton = styled.button`
  color: ${toolbarIconColor.base};
  border: none;
  padding: 0;
  background: none;
  overflow: visible;
  cursor: pointer;

  :hover {
    color: ${toolbarIconColor.darker};
  }
`;

// tslint:disable-next-line:variable-name
export const OpenSidebar = ({ isActive, children, ...props }
  : React.PropsWithChildren<OpenSidebarProps>) => {
  return <ToCToolbarButton
    aria-label={useIntl().formatMessage({ id: 'i18n:toc:toggle:closed' })}
    data-analytics-label='Click to open the Table of Contents'
    data-testid='toc-button'
    isActive={isActive}
    isRed={true}
    {...props}
  >
    <TocIcon />
    <ToCButtonText>
      {useIntl().formatMessage({ id: 'i18n:toc:title' })}
    </ToCButtonText>
    {children}
  </ToCToolbarButton>;
  };

// tslint:disable-next-line:variable-name
export const CloseSidebar = ({ children, ...props}: React.PropsWithChildren<CloseSidebarProps>) =>
  <ToCButton
    aria-label={useIntl().formatMessage({ id: 'i18n:toc:toggle:opened' })}
    data-analytics-label='Click to close the Table of Contents'
    data-testid='toc-button'
    {...props}
  >
    {children}
  </ToCButton>;

// tslint:disable-next-line:variable-name
export const OpenSidebarControl = connect(() => ({}),
  (dispatch: Dispatch) => ({
    onClick: () => dispatch(actions.openToc()),
  }))(OpenSidebar);

// tslint:disable-next-line:variable-name
export const CloseSidebarControl = connect(() => ({}),
  (dispatch: Dispatch) => ({
    onClick: () => dispatch(actions.closeToc()),
  }))(CloseSidebar);
