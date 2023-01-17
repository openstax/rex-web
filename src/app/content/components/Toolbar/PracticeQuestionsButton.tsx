import React from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import practiceQuestionsIcon from '../../../../assets/practiceQuestionsIcon.svg';
import { useAnalyticsEvent } from '../../../../helpers/analytics';
import { useServices } from '../../../context/Services';
import { replace } from '../../../navigation/actions';
import * as navigation from '../../../navigation/selectors';
import { AnyMatch } from '../../../navigation/types';
import { getQueryForParam } from '../../../navigation/utils';
import { modalQueryParameterName } from '../../constants';
import { modalUrlName } from '../../practiceQuestions/constants';
import {
  hasPracticeQuestions,
  isPracticeQuestionsOpen,
  practiceQuestionsEnabled
} from '../../practiceQuestions/selectors';
import { bookAndPage } from '../../selectors';
import { toolbarIconStyles } from './iconStyles';
import { PlainButton, toolbarDefaultButton, toolbarDefaultText } from './styled';

// tslint:disable-next-line:variable-name
export const StyledPracticeQuestionsButton = styled(PlainButton)`
  ${toolbarDefaultButton}
  height: auto;
  padding: 0;

  > svg {
    ${toolbarIconStyles}
  }
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsIcon = styled.img`
  ${toolbarIconStyles}
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsText = styled.span`
  ${toolbarDefaultText}
  font-size: 1.2rem;
  line-height: 1.5rem;
`;

// tslint:disable-next-line:variable-name
const PracticeQuestionsButton = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const state = useServices().getState();
  const match = navigation.match(state);
  const existingQuery = navigation.query(state);
  const isEnabled = useSelector(practiceQuestionsEnabled);
  const isPracticeQOpen = useSelector(isPracticeQuestionsOpen);
  const trackOpenClose = useAnalyticsEvent('openClosePracticeQuestions');
  const hasPracticeQs = useSelector(hasPracticeQuestions);
  const { book, page } = useSelector(bookAndPage);

  if (!isEnabled || !hasPracticeQs || !book || !page) { return null; }

  const openPracticeQuestions = () => {
    dispatch(replace(match as AnyMatch, {
      search: getQueryForParam({[modalQueryParameterName]: modalUrlName}, existingQuery),
    }));
    trackOpenClose();
  };

  const text = intl.formatMessage({id: 'i18n:toolbar:practice-questions:button:text'});

  return <StyledPracticeQuestionsButton
    onClick={() => openPracticeQuestions()}
    aria-label={text}
    isActive={isPracticeQOpen}>
    <PracticeQuestionsIcon aria-hidden='true' src={practiceQuestionsIcon} />
    <PracticeQuestionsText>{text}</PracticeQuestionsText>
  </StyledPracticeQuestionsButton>;
};

export default PracticeQuestionsButton;
