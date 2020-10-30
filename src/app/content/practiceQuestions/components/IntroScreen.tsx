import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import * as pqSelectors from '../selectors';
import Button from './Button';

// tslint:disable-next-line: variable-name
const IntroScreenWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

// tslint:disable-next-line: variable-name
const IntroScreenMessage = styled.span`
  padding: 2rem 0;
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
    <Button>
      <FormattedMessage id='i18n:practice-questions:popup:intro:start'>
        {(msg: string) => msg}
      </FormattedMessage>
    </Button>
  </IntroScreenWrapper>;
};

export default IntroScreen;
