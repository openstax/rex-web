import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import highlightIcon from '../../../../assets/highlightIcon.svg';
import * as selectors from '../../../content/highlights/selectors';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { openMyHighlights } from '../../highlights/actions';
import { PlainButton, toolbarDefaultText, toolbarIconStyles } from './styled';

interface Props {
  openMyHighlights: () => void;
  myHighlightsOpen?: boolean;
}

// tslint:disable-next-line:variable-name
const MyHighlightsWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 2rem;
  ${theme.breakpoints.mobile(css`
    margin-left: 0;
  `)}
`;

// tslint:disable-next-line:variable-name
const MyHighlightsIcon = styled.img`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const MyHighlightsText = styled.span`
  ${toolbarDefaultText}
`;

class HighlightButton extends Component<Props> {
  public render() {
    return (
      <MyHighlightsWrapper onClick={() => this.props.openMyHighlights()}>
        <MyHighlightsIcon aria-hidden='true' src={highlightIcon} />
        <FormattedMessage id='i18n:toolbar:highlights:text'>
          {(msg: Element | string) =>
            <MyHighlightsText>{msg}</MyHighlightsText>
          }
        </FormattedMessage>
      </MyHighlightsWrapper>
    );
  }
}

export default connect(
  (state: AppState) => ({
    myHighlightsOpen: selectors.myHighlightsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    openMyHighlights: () => dispatch(openMyHighlights()),
  })
)(HighlightButton);
