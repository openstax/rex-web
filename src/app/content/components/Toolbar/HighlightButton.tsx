import React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import highlightIcon from '../../../../assets/highlightIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import theme from '../../../theme';
import { AppState, Dispatch } from '../../../types';
import { openMyHighlights as openMyHighlightsAction } from '../../highlights/actions';
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

// tslint:disable-next-line:variable-name
const HighlightButton = ({ enabled, openMyHighlights}: Props) => {
  const trackOpenCloseMH = useAnalyticsEvent('openCloseMH');

  const openHighlightsSummary = () => {
    openMyHighlights();
    trackOpenCloseMH();
  };

  return enabled
    ? <FormattedMessage id='i18n:toolbar:highlights:text'>
      {(msg: Element | string) =>
        <MyHighlightsWrapper onClick={() => openHighlightsSummary()} aria-label={msg}>
          <MyHighlightsIcon aria-hidden='true' src={highlightIcon} />
          <MyHighlightsText>{msg}</MyHighlightsText>
        </MyHighlightsWrapper>
      }
    </FormattedMessage>
    : null
  ;
};

export default connect(
  (state: AppState) => ({
    enabled: selectors.isEnabled(state),
    myHighlightsOpen: selectors.myHighlightsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    openMyHighlights: () => dispatch(openMyHighlightsAction()),
  })
)(HighlightButton);
