import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import * as pqSelectors from '../../selectors';
import { PracticeAnswer, PracticeQuestion } from '../../types';
import PQButton from '../PQButton';

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

interface QuestionNavigationProps {
  question: PracticeQuestion;
  selectedAnswer: PracticeAnswer | null;
}

// tslint:disable-next-line: variable-name
const QuestionNavigation = ({ question, selectedAnswer }: QuestionNavigationProps) => {
  const questionsAndAnswers = useSelector(pqSelectors.questionsAndAnswers);
  const isFinalQuestion = useSelector(pqSelectors.isFinalQuestion);
  const showSkipAndSubmit = !questionsAndAnswers.has(question.id);
  const submittedAnswer = questionsAndAnswers.get(question.id);
  const showShowAnswer = submittedAnswer && submittedAnswer.correctness === '0.0';
  const showNext = Boolean(submittedAnswer && !isFinalQuestion);
  const showFinish = Boolean(submittedAnswer && isFinalQuestion);

  return <Wrapper>
    {showSkipAndSubmit && <React.Fragment>
      <PQButton withoutBg={true}>
        <FormattedMessage id='i18n:practice-questions:popup:navigation:skip'>
          {(msg: string) => msg}
        </FormattedMessage>
      </PQButton>
      <PQButton disabled={selectedAnswer ? false : true}>
        <FormattedMessage id='i18n:practice-questions:popup:navigation:submit'>
          {(msg: string) => msg}
        </FormattedMessage>
      </PQButton>
    </React.Fragment>}
    {showShowAnswer && <PQButton withoutBg={true}>
      <FormattedMessage id='i18n:practice-questions:popup:navigation:show-answer'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>}
    {showNext && <PQButton>
      <FormattedMessage id='i18n:practice-questions:popup:navigation:next'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>}
    {showFinish && <PQButton>
      <FormattedMessage id='i18n:practice-questions:popup:navigation:finish'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>}
  </Wrapper>;
};

export default QuestionNavigation;
