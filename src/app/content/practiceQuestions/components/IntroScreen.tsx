import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import Button from '../../../components/Button';
import { textRegularSize } from '../../../components/Typography';
import { nextQuestion } from '../actions';
import * as pqSelectors from '../selectors';

// tslint:disable-next-line: variable-name
const IntroScreenWrapper = styled.div`
  text-align: center;

  ${Button} {
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
        {(msg) => msg}
      </FormattedMessage>
    </IntroScreenMessage>
    <Button
      variant='primary'
      size='large'
      onClick={() => dispatch(nextQuestion())}
      data-analytics-label='Start now'
    >
      <FormattedMessage id='i18n:practice-questions:popup:intro:start'>
        {(msg) => msg}
      </FormattedMessage>
    </Button>
  </IntroScreenWrapper>;
};

export default IntroScreen;
