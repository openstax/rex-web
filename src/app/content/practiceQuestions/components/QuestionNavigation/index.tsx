import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled from 'styled-components/macro';
import * as pqSelectors from '../../selectors';
import { PracticeAnswer, PracticeQuestion } from '../../types';
import PQButton, { PQInput } from '../PQButton';

// tslint:disable-next-line: variable-name
const Wrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

interface QuestionNavigationProps {
  question: PracticeQuestion;
  selectedAnswer: PracticeAnswer | null;
  onSkip: () => void;
  onSubmit: () => void;
  onShowAnswer: () => void;
  onNext: () => void;
  onFinish: () => void;
}

// tslint:disable-next-line: variable-name
const QuestionNavigation = ({ question, selectedAnswer, ...props }: QuestionNavigationProps) => {
  const questionsAndAnswers = useSelector(pqSelectors.questionsAndAnswers);
  const isFinalQuestion = useSelector(pqSelectors.isFinalQuestion);
  const showSkipAndSubmit = !questionsAndAnswers.has(question.id);
  const submittedAnswer = questionsAndAnswers.get(question.id);
  const showShowAnswer = submittedAnswer && submittedAnswer.correctness === '0.0';
  const showNext = Boolean(submittedAnswer && !isFinalQuestion);
  const showFinish = Boolean(submittedAnswer && isFinalQuestion);

  return <Wrapper>
    {showSkipAndSubmit && <React.Fragment>
      <PQButton withoutBg={true} onClick={props.onSkip}>
        <FormattedMessage id='i18n:practice-questions:popup:navigation:skip'>
          {(msg: string) => msg}
        </FormattedMessage>
      </PQButton>
      <FormattedMessage id='i18n:practice-questions:popup:navigation:submit'>
          {(msg: string) => (
            <PQInput
              type='submit'
              value={msg}
              disabled={selectedAnswer ? false : true}
              onClick={props.onSubmit}
            />
          )}
      </FormattedMessage>
    </React.Fragment>}
    {showShowAnswer && <PQButton withoutBg={true} onClick={props.onShowAnswer}>
      <FormattedMessage id='i18n:practice-questions:popup:navigation:show-answer'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>}
    {showNext && <PQButton onClick={props.onNext}>
      <FormattedMessage id='i18n:practice-questions:popup:navigation:next'>
        {(msg: string) => msg}
      </FormattedMessage>
    </PQButton>}
    {showFinish && <FormattedMessage id='i18n:practice-questions:popup:navigation:finish'>
      {(msg: string) => <PQInput type='submit' value={msg} onClick={props.onFinish} />}
    </FormattedMessage>}
  </Wrapper>;
};

export default QuestionNavigation;
