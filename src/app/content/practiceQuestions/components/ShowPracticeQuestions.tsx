import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { h4Style, linkColor } from '../../../components/Typography';
import theme from '../../../theme';
import * as contentSelectors from '../../selectors';
import { PopupBody } from '../../styles/PopupStyles';
import { getBookPageUrlAndParams } from '../../utils/urlUtils';
import * as pqSelectors from '../selectors';
import { PracticeAnswer, PracticeQuestion } from '../types';
import { getNextPageWithPracticeQuestions } from '../utils';
import EmptyScreen from './EmptyScreen';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';
import QuestionNavigation from './QuestionNavigation';

// tslint:disable-next-line:variable-name
export const ShowPracticeQuestionsBody = styled(PopupBody)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${theme.color.neutral.darker};
  padding: 2rem 3.2rem 2.5rem 3.2rem;
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
export const SectionTitle = styled.div`
  ${h4Style}
  font-weight: bold;
  padding: 0;
  margin-top: 0;
  margin-bottom: 3rem;
  color: ${theme.color.text.default};
  ${theme.breakpoints.mobile(css`
    margin: 1.4rem;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
export const QuestionsWrapper = styled.div`
  flex: 1;
  border: 1px solid ${theme.color.neutral.darkest};
`;

// tslint:disable-next-line: variable-name
export const QuestionsHeader = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: ${theme.color.text.default};
  background-color: ${theme.color.neutral.darkest};
  height: 3.2rem;
  width: 100%;
  padding: 0 3.2rem;
  display: flex;
  align-items: center;
`;

// tslint:disable-next-line: variable-name
export const StyledContentLink = styled.a`
  display: block;
  font-size: 1.4rem;
  color: #929292;
  margin-top: 2.5rem;
  text-decoration: none;

  > span {
    color: ${linkColor};

    &::before {
      content: " ";
    }
  }

  ${theme.breakpoints.mobile(css`
    margin: 1.2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const ShowPracticeQuestions = () => {
  const {book, page} = useSelector(contentSelectors.bookAndPage);
  const section = useSelector(pqSelectors.selectedSection);
  const questionsCount = useSelector(pqSelectors.questionsCount);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);
  const selectedSectionHasPracticeQuestions = useSelector(pqSelectors.selectedSectionHasPracticeQuestions);
  const locationFilters = useSelector(pqSelectors.practiceQuestionsLocationFilters);
  const linkToTheSection = React.useMemo(() => {
    return book && section ? getBookPageUrlAndParams(book, section).url : null;
  }, [book, section]);
  const nextSection = React.useMemo(() => {
    const currentSectionId = section ? section.id : page ? page.id : null;
    return currentSectionId ? getNextPageWithPracticeQuestions(currentSectionId, locationFilters, book) : undefined;
  }, [book, page, section, locationFilters]);

  return (
    <ShowPracticeQuestionsBody
      data-testid='show-practice-questions-body'
      data-analytics-region='PQ popup'
    >
      {section ? <SectionTitle dangerouslySetInnerHTML={{ __html: section.title }} /> : null}
      {questionsCount === 0 && nextSection
        ? <EmptyScreen nextSection={nextSection} />
        : (
          <QuestionsWrapper>
            <QuestionsHeader>
              <FormattedMessage id='i18n:practice-questions:popup:questions'>
                {(msg: string) => msg}
              </FormattedMessage>
            </QuestionsHeader>
            <ProgressBar total={questionsCount} activeIndex={currentQuestionIndex} />
            {
              selectedSectionHasPracticeQuestions && currentQuestionIndex === null
                ? <IntroScreen />
                : null
            }
            <QuestionNavigation
              question={question}
              selectedAnswer={answer}
              onSkip={() => null}
              onSubmit={() => null}
              onShowAnswer={() => null}
              onNext={() => null}
              onFinish={() => null}
            />
          </QuestionsWrapper>
        )
      }
      {
        section && linkToTheSection
          ? <StyledContentLink href={linkToTheSection} target='_blank' data-analytics-label='Go to link' >
            <FormattedMessage id='i18n:practice-questions:popup:read'>
              {(msg: string) => msg}
            </FormattedMessage>
            <span dangerouslySetInnerHTML={{ __html: section.title }} />
          </StyledContentLink>
          : null
      }
    </ShowPracticeQuestionsBody>
  );
};

export default ShowPracticeQuestions;

const question = {
  "uuid": "0e1d41f5-f972-4e3c-b054-358edb8a6562",
  "stem_html": "If you and a friend are standing side-by-side watching a soccer game, would you both view the motion from the same reference frame?",
  "id": 91802,
  "answers": [
    {
      "id": 374182,
      "content_html": "Yes, we would both view the motion from the same reference point because both of us are at rest in Earth’s frame of reference.",
      "correctness": "0.0",
      "feedback_html": "Even though both are at rest in Earth’s frame of reference, the point from where the motion of the soccer game is observed, is different. For example, if the ball is right in front of one person, then for the other person, the ball will be seen at an angle."
    },
    {
      "id": 374183,
      "content_html": "Yes, we would both view the motion from the same reference point because both of us are observing the motion from two points on the same straight line.",
      "correctness": "0.0",
      "feedback_html": "The reference frames are similar but not same. The two reference frames are located at two different points, hence the motion described by each frame will be slightly different."
    },
    {
      "id": 374185,
      "content_html": "No, we would both view the motion from different reference points because motion is viewed from two different points; the reference frames are similar but not the same.",
      "correctness": "1.0",
      "feedback_html": "The motions observed are different since the reference frames are located at two different points."
    },
    {
      "id": 374184,
      "content_html": "No, we would both view the motion from different reference points because response times may be different; so, the motion observed by both of us would be different.",
      "correctness": "0.0",
      "feedback_html": "The response times may be different, but they have nothing to do with thereference frames."
    }
  ]
} as PracticeQuestion;

const answer = {
  "id": 374183,
  "content_html": "Yes, we would both view the motion from the same reference point because both of us are observing the motion from two points on the same straight line.",
  "correctness": "0.0",
  "feedback_html": "The reference frames are similar but not same. The two reference frames are located at two different points, hence the motion described by each frame will be slightly different."
} as PracticeAnswer;
