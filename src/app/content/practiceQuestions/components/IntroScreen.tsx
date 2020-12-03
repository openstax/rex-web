import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import { textRegularSize } from '../../../components/Typography';
import { nextQuestion } from '../actions';
import * as pqSelectors from '../selectors';
import PQButton from './PQButton';

// tslint:disable-next-line: variable-name
const IntroScreenWrapper = styled.div`
  text-align: center;

  ${PQButton} {
    display: block;
    margin: 2rem auto;
  }
`;

// tslint:disable-next-line: variable-name
const IntroScreenMessage = styled.span`
  ${textRegularSize}
  margin: 4rem 0;
`;

// tslint:disable-next-line: variable-name
const IntroScreen = () => {
  const questionsCount = useSelector(pqSelectors.questionsCount);
  const dispatch = useDispatch();

  return <IntroScreenWrapper>
    <IntroScreenMessage>
      <FormattedMessage id='i18n:practice-questions:popup:intro:message' values={{ questions: questionsCount }}>
        {(msg: string) => msg}
      </FormattedMessage>
    </IntroScreenMessage>
    <PQButton
      variant='primary'
      size='large'
      onClick={() => dispatch(nextQuestion())}
      data-analytics-label='Start now'
    >
      <FormattedMessage id='i18n:practice-questions:popup:intro:start'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>
  </IntroScreenWrapper>;
};

export default IntroScreen;
