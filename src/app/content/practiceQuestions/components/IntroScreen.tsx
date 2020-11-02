import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import * as pqSelectors from '../selectors';
import PQButton from './PQButton';

// tslint:disable-next-line: variable-name
const IntroScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  ${PQButton} {
    margin: 2rem 0;
  }
`;

// tslint:disable-next-line: variable-name
const IntroScreenMessage = styled.span`
  font-family: inherit;
  font-size: 1.6rem;
  margin: 2rem 0;
`;

// tslint:disable-next-line: variable-name
const IntroScreen = () => {
  const questions = useSelector(pqSelectors.questions);

  return <IntroScreenWrapper>
    <IntroScreenMessage>
      <FormattedMessage id='i18n:practice-questions:popup:intro:message' values={{ questions: questions.length }}>
        {(msg: string) => msg}
      </FormattedMessage>
    </IntroScreenMessage>
    <PQButton>
      <FormattedMessage id='i18n:practice-questions:popup:intro:start'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>
  </IntroScreenWrapper>;
};

export default IntroScreen;
