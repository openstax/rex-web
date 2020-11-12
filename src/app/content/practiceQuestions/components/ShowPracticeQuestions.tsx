import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import styled, { css } from 'styled-components/macro';
import { h4Style, linkColor } from '../../../components/Typography';
import theme from '../../../theme';
import ContentLink from '../../components/ContentLink';
import * as contentSelectors from '../../selectors';
import { PopupBody } from '../../styles/PopupStyles';
import * as pqSelectors from '../selectors';
import Filters from './Filters';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';

// tslint:disable-next-line:variable-name
export const ShowPracticeQuestionsBody = styled(PopupBody)`
  background: ${theme.color.neutral.darker};
  ${theme.breakpoints.mobile(css`
    padding: 0;
  `)}
`;

// tslint:disable-next-line: variable-name
export const ShowPracitceQuestionsContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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
  display: flex;
  flex-direction: column;
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
export const StyledContentLink = styled(ContentLink)`
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
  const book = useSelector(contentSelectors.book);
  const section = useSelector(pqSelectors.selectedSection);
  const questionsCount = useSelector(pqSelectors.questionsCount);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);
  const selectedSectionHasPracticeQuestions = useSelector(pqSelectors.selectedSectionHasPracticeQuestions);

  return (
    <ShowPracticeQuestionsBody
      data-testid='show-practice-questions-body'
      data-analytics-region='PQ popup'
    >
      <Filters />
      <ShowPracitceQuestionsContent>
        {section ? <SectionTitle dangerouslySetInnerHTML={{ __html: section.title }} /> : null}
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
        </QuestionsWrapper>
        {
          book && section
            ? <StyledContentLink book={book} page={section} data-analytics-label='Read'>
              <FormattedMessage id='i18n:practice-questions:popup:read'>
                {(msg: string) => msg}
              </FormattedMessage>
              <span dangerouslySetInnerHTML={{ __html: section.title }} />
            </StyledContentLink>
            : null
        }
      </ShowPracitceQuestionsContent>
    </ShowPracticeQuestionsBody>
  );
};

export default ShowPracticeQuestions;
