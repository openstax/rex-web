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
import { getNextPageWithPracticeQuestions } from '../utils';
import EmptyScreen from './EmptyScreen';
import FinalScreen from './FinalScreen';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';
import Question from './Question';

// tslint:disable-next-line:variable-name
export const ShowPracticeQuestionsBody = styled(PopupBody)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: ${theme.color.neutral.darker};
  padding: 2rem 3.2rem 0 3.2rem;
  ${theme.breakpoints.mobile(css`
    text-align: left;
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
export const SectionTitle = styled.div`
  ${h4Style}
  flex-shrink: 0;
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
  flex: 1 0;
  overflow: initial;
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
  width: max-content;
  flex-shrink: 0;
  font-size: 1.4rem;
  color: #929292;
  padding: 2.5rem 0;
  text-decoration: none;

  > span {
    color: ${linkColor};

    &::before {
      content: " ";
    }
  }

  ${theme.breakpoints.mobile(css`
    padding: 1.2rem;
  `)}
`;

// tslint:disable-next-line: variable-name
const ShowPracticeQuestions = () => {
  const {book, page} = useSelector(contentSelectors.bookAndPage);
  const section = useSelector(pqSelectors.selectedSection);
  const questionsCount = useSelector(pqSelectors.questionsCount);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);
  const locationFilters = useSelector(pqSelectors.practiceQuestionsLocationFilters);
  const linkToTheSection = React.useMemo(() => {
    return book && section ? getBookPageUrlAndParams(book, section).url : null;
  }, [book, section]);
  const nextSection = React.useMemo(() => {
    const currentSectionId = section ? section.id : page ? page.id : null;
    return currentSectionId ? getNextPageWithPracticeQuestions(currentSectionId, locationFilters, book) : undefined;
  }, [book, page, section, locationFilters]);
  const questionsInProggress = useSelector(pqSelectors.questionsInProggress);
  const hasAnswers = useSelector(pqSelectors.hasAnswers);

  return (
    <ShowPracticeQuestionsBody
      data-testid='show-practice-questions-body'
      data-analytics-region='PQ popup'
    >
      {section ? <SectionTitle dangerouslySetInnerHTML={{ __html: section.title }} /> : null}
      {questionsCount === 0
        ? (nextSection
          ? <EmptyScreen nextSection={nextSection} />
          : <FinalScreen />
        )
        : hasAnswers && !questionsInProggress
          ? <FinalScreen nextSection={nextSection} />
          : (
            <QuestionsWrapper>
              <QuestionsHeader>
                <FormattedMessage id='i18n:practice-questions:popup:questions'>
                  {(msg: string) => msg}
                </FormattedMessage>
              </QuestionsHeader>
              <ProgressBar total={questionsCount} activeIndex={currentQuestionIndex} />
              {questionsInProggress ? <Question /> : <IntroScreen />}
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
