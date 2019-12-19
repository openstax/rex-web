import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import highlightIcon from '../../../../assets/highlightIcon.svg';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { openMyHighlights } from '../../highlights/actions';
import * as selectors from '../../highlights/selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultText } from './styled';

interface Props {
  openMyHighlights: () => void;
  myHighlightsOpen?: boolean;
  enabled: boolean;
}

// tslint:disable-next-line:variable-name
const MyHighlightsWrapper = styled(PlainButton)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 2rem;
  height: auto;

  :focus {
    outline: auto -webkit-focus-ring-color;
  }

  ${theme.breakpoints.mobile(css`
    margin-right: 0;
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
    return this.props.enabled
      ? <FormattedMessage id='i18n:toolbar:highlights:text'>
        {(msg: Element | string) =>
          <MyHighlightsWrapper onClick={() => this.props.openMyHighlights()} aria-label={msg}>
            <MyHighlightsIcon aria-hidden='true' src={highlightIcon} />
            <MyHighlightsText>{msg}</MyHighlightsText>
          </MyHighlightsWrapper>
        }
      </FormattedMessage>
      : null
    ;
  }
}

export default connect(
  (state: AppState) => ({
    enabled: selectors.isEnabled(state),
    myHighlightsOpen: selectors.myHighlightsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    openMyHighlights: () => dispatch(openMyHighlights()),
  })
)(HighlightButton);
