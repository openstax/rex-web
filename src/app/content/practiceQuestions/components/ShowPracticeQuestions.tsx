import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import theme from '../../../theme';
import { PopupBody } from '../../styles/PopupStyles';
import * as pqSelectors from '../selectors';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';

// tslint:disable-next-line:variable-name
export const ShowPracticeQuestionsBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  padding: 2rem 3.2rem;
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
const SectionTitle = styled.h2`
  font-size: 1.8rem;
  line-height: 2.5rem;
  color: #424242;
  margin-bottom: 3rem;
`;

// tslint:disable-next-line: variable-name
const QuestionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #E5E5E5;

  ${ProgressBar} {
    margin: 6.4rem 3.2rem;
    ${theme.breakpoints.mobile(css`
      margin: 1rem;
    `)}
  }
`;

// tslint:disable-next-line: variable-name
const QuestionsHeader = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: #424242;
  background-color: #E5E5E5;
  height: 3.2rem;
  width: 100%;
  padding: 0 3.2rem;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line: variable-name
const ShowPracticeQuestions = () => {
  const section = useSelector(pqSelectors.selectedSection);
  const questions = useSelector(pqSelectors.questions);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);

  return (
    <ShowPracticeQuestionsBody
      data-testid='show-practice-questions-body'
      data-analytics-region='PQ popup'
    >
      {section ? <SectionTitle dangerouslySetInnerHtml={{ __html: section.title }} /> : null}
      <QuestionsWrapper>
        <QuestionsHeader>
          <FormattedMessage id='i18n:practice-questions:popup:questions'>
            {(msg: string) => msg}
          </FormattedMessage>
        </QuestionsHeader>
        <ProgressBar total={questions.length} activeIndex={currentQuestionIndex} />
        {
          section && questions.length && currentQuestionIndex === null
            ? <IntroScreen />
            : null
        }
      </QuestionsWrapper>
    </ShowPracticeQuestionsBody>
  );
};

export default ShowPracticeQuestions;
