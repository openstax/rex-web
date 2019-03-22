import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css, FlattenSimpleInterpolation } from 'styled-components';
import { ListOl } from 'styled-icons/fa-solid/ListOl';
import { contentFont, textRegularSize } from '../../components/Typography';
import theme from '../../theme';
import { AppState, Dispatch } from '../../types';
import { assertString } from '../../utils';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { State } from '../types';
import { toolbarIconColor, toolbarIconStyles } from './Toolbar';

export const styleWhenSidebarClosed = (closedStyle: FlattenSimpleInterpolation) => css`
  ${(props: {isOpen: State['tocOpen']}) => props.isOpen === null && theme.breakpoints.mobile(closedStyle)}
  ${(props: {isOpen: State['tocOpen']}) => props.isOpen === false && closedStyle}
`;

interface InnerProps {
  isOpen: State['tocOpen'];
  onClick: () => void;
  className?: string;
}
interface MiddleProps {
  isOpen: State['tocOpen'];
  openToc: () => void;
  closeToc: () => void;
}

// tslint:disable-next-line:variable-name
const ListIcon = styled(ListOl)`
  ${toolbarIconStyles};
`;

// tslint:disable-next-line:variable-name
const ToCButtonText = styled.h3`
  font-family: ${contentFont};
  ${textRegularSize};
  color: ${toolbarIconColor};
  margin: 0;
  padding: 0;
`;

// tslint:disable-next-line:variable-name
const ToCButton = styled.button`
  border: none;
  padding: 0;
  margin: 0;
  overflow: visible;
  background: none;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line:variable-name
export const SidebarControl: React.SFC<InnerProps> = ({isOpen, onClick, className}) =>
  <FormattedMessage id={isOpen ? 'i18n:toc:toggle:opened' : 'i18n:toc:toggle:closed'}>
    {(msg: Element | string) => {
      const txt = assertString(msg, 'Aria label only supports strings');
      return <ToCButton
        className={className}
        aria-label={txt}
        onClick={onClick}
      >
        <ListIcon/><ToCButtonText>Table of contents</ToCButtonText>
      </ToCButton>;
    }}
  </FormattedMessage>;

// tslint:disable-next-line:variable-name
export const OpenSidebarControl = styled(
  (props: MiddleProps) => <SidebarControl {...props} isOpen={false} onClick={props.openToc} />
)`
  display: none;
  ${styleWhenSidebarClosed(css`
    display: flex;
  `)}
`;

// tslint:disable-next-line:variable-name
export const CloseSidebarControl = styled(
  (props: MiddleProps) => <SidebarControl {...props} isOpen={true} onClick={props.closeToc} />
)`
  ${styleWhenSidebarClosed(css`
    display: none;
  `)}
`;

// bug in types, only class components can return an array
class CombinedSidebarControl extends React.Component<MiddleProps> {
  public render() {
    return [
      <OpenSidebarControl {...this.props} key='open-sidebar' />,
      <CloseSidebarControl {...this.props} key='close-sidebar' />,
    ];
  }
}

export default connect(
  (state: AppState) => ({
    isOpen:  selectors.tocOpen(state),
  }),
  (dispatch: Dispatch): {openToc: typeof actions['openToc'], closeToc: typeof actions['closeToc']} => ({
    closeToc:  () => dispatch(actions.closeToc()),
    openToc: () => dispatch(actions.openToc()),
  })
)(CombinedSidebarControl);
