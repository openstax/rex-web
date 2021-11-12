import React from 'react';
import { useIntl } from 'react-intl';
import { connect, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import HighlightsIcon from '../../../../assets/HighlightsIcon';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { AppState, Dispatch } from '../../../types';
import { openMyHighlights as openMyHighlightsAction } from '../../highlights/actions';
import * as selectors from '../../highlights/selectors';
import { practiceQuestionsEnabled as practiceQuestionsEnabledSelector } from '../../practiceQuestions/selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultButton, toolbarDefaultText } from './styled';

interface Props {
  openMyHighlights: () => void;
  myHighlightsOpen?: boolean;
}

// tslint:disable-next-line:variable-name
const MyHighlightsWrapper = styled(PlainButton)`
  ${toolbarDefaultButton}
  height: auto;
  padding: 0 10px;

  > svg {
    ${toolbarIconStyles}
  }
`;

// tslint:disable-next-line:variable-name
const MyHighlightsText = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

// tslint:disable-next-line:variable-name
const HighlightButton = ({ openMyHighlights, myHighlightsOpen }: Props) => {
  const practiceQuestionsEnabled = useSelector(practiceQuestionsEnabledSelector);
  const trackOpenCloseMH = useAnalyticsEvent('openCloseMH');

  const openHighlightsSummary = () => {
    openMyHighlights();
    trackOpenCloseMH();
  };

  const text = useIntl().formatMessage({id: 'i18n:toolbar:highlights:text'});

  return <MyHighlightsWrapper
    isActive={myHighlightsOpen}
    onClick={() => openHighlightsSummary()}
    aria-label={text}
    data-analytics-label='My highlights'
    practiceQuestionsEnabled={practiceQuestionsEnabled}
  >
    <HighlightsIcon />
    <MyHighlightsText>{text}</MyHighlightsText>
  </MyHighlightsWrapper>;
};

export default connect(
  (state: AppState) => ({
    myHighlightsOpen: selectors.myHighlightsOpen(state),
  }),
  (dispatch: Dispatch) => ({
    openMyHighlights: () => dispatch(openMyHighlightsAction()),
  })
)(HighlightButton);
