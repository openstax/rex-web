import React from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import theme from '../../../theme';
import * as contentSelectors from '../../selectors';
import LoaderWrapper from '../../styles/LoaderWrapper';
import { PopupBody } from '../../styles/PopupStyles';
import { splitTitleParts } from '../../utils/archiveTreeUtils';
import * as pqSelectors from '../selectors';
import { getNextPageWithPracticeQuestions } from '../utils';
import EmptyScreen, { EmptyScreenStatus } from './EmptyScreen';
import Filters from './Filters';
import FinalScreen, { FinalScreenStatus } from './FinalScreen';
import IntroScreen from './IntroScreen';
import ProgressBar from './ProgressBar';
import Question from './Question';
import { LinkedArchiveTreeSection } from '../../types';
import './ShowPracticeQuestions.css';

function MaybeSectionTitle() {
  const section = useSelector(pqSelectors.selectedSection);

  if (!section) {
    return null;
  }

  return (
    <h2
      className="show-practice-questions-section-title"
      tabIndex={-1}
      dangerouslySetInnerHTML={{ __html: section.title }}
      style={{
        '--section-title-color': theme.color.text.default,
      } as React.CSSProperties}
    />
  );
}

// Export for backward compatibility with tests
export const SectionTitle = MaybeSectionTitle;

// Export wrapper components for backward compatibility with tests
export const QuestionsWrapper = (props: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props} className="show-practice-questions-wrapper" />
);


export const QuestionsHeader = (props: React.HTMLAttributes<HTMLHeadingElement>) => (
  // eslint-disable-next-line jsx-a11y/heading-has-content
  <h3 {...props} className="show-practice-questions-header" id='progress-bar-header' />
);

interface StatusRegionProps {
  questionsCount: number;
  nextSection: LinkedArchiveTreeSection | undefined;
  hasAnswers: boolean;
  questionsInProgress: boolean;
}

function StatusRegion({ questionsCount, nextSection, hasAnswers, questionsInProgress }: StatusRegionProps) {
  const shouldShowFinalStatus = questionsCount === 0 && !nextSection;
  const shouldShowFinalStatusAfterCompletion = questionsCount > 0 && hasAnswers && !questionsInProgress;

  if (shouldShowFinalStatus || shouldShowFinalStatusAfterCompletion) {
    return (
      <div role="status">
        <FinalScreenStatus />
      </div>
    );
  }

  if (questionsCount === 0 && nextSection) {
    return (
      <div role="status">
        <EmptyScreenStatus />
      </div>
    );
  }

  return null;
}

interface PracticeQuestionsDisplayProps {
  questionsCount: number;
  nextSection: LinkedArchiveTreeSection | undefined;
  hasAnswers: boolean;
  questionsInProgress: boolean;
  currentQuestionIndex: number | null;
}

function PracticeQuestionsDisplay({
  questionsCount,
  nextSection,
  hasAnswers,
  questionsInProgress,
  currentQuestionIndex,
}: PracticeQuestionsDisplayProps) {
  // No questions available
  if (questionsCount === 0) {
    if (nextSection) {
      return <EmptyScreen nextSection={nextSection} />;
    }
    return <FinalScreen />;
  }

  // Questions finished
  if (hasAnswers && !questionsInProgress) {
    return <FinalScreen nextSection={nextSection} />;
  }

  // Questions in progress or intro screen
  return (
    <QuestionsWrapper
      style={{
        '--wrapper-border-color': theme.color.neutral.darkest,
        '--wrapper-bg-color': theme.color.white,
      } as React.CSSProperties}
    >
      <QuestionsHeader
        style={{
          '--header-text-color': theme.color.text.default,
          '--header-bg-color': theme.color.neutral.darkest,
        } as React.CSSProperties}
      >
        <FormattedMessage id='i18n:practice-questions:popup:questions'>
          {(msg) => msg}
        </FormattedMessage>
      </QuestionsHeader>
      <ProgressBar total={questionsCount} activeIndex={currentQuestionIndex} />
      {questionsInProgress ? <Question /> : <IntroScreen />}
    </QuestionsWrapper>
  );
}

const ShowPracticeQuestions = () => {
  const {book, page} = useSelector(contentSelectors.bookAndPage);
  const questionsCount = useSelector(pqSelectors.questionsCount);
  const currentQuestionIndex = useSelector(pqSelectors.currentQuestionIndex);
  const locationFilters = useSelector(pqSelectors.practiceQuestionsLocationFilters);
  const section = useSelector(pqSelectors.selectedSection);
  const nextSection = React.useMemo(() => {
    const currentSectionId = section ? section.id : page ? page.id : null;
    return currentSectionId ? getNextPageWithPracticeQuestions(currentSectionId, locationFilters, book) : undefined;
  }, [book, page, section, locationFilters]);
  const questionsInProgress = useSelector(pqSelectors.questionsInProgress);
  const hasAnswers = useSelector(pqSelectors.hasAnswers);
  const isLoading = useSelector(pqSelectors.practiceQuestionsAreLoading);

  return (
    <PopupBody
      className="show-practice-questions-body"
      data-testid='show-practice-questions-body'
      data-analytics-region='PQ popup'
      data-analytics-location={section ? splitTitleParts(section.title).join(' ') : 'section not loaded'}
      style={{
        '--body-bg': theme.color.neutral.darker,
        '--body-padding': 'initial',
      } as React.CSSProperties}
    >
      <Filters />
      {isLoading ? (
        <LoaderWrapper><Loader large /></LoaderWrapper>
      ) : (
        <div className="show-practice-questions-content">
          <MaybeSectionTitle />
          <StatusRegion
            questionsCount={questionsCount}
            nextSection={nextSection}
            hasAnswers={hasAnswers}
            questionsInProgress={questionsInProgress}
          />
          <PracticeQuestionsDisplay
            questionsCount={questionsCount}
            nextSection={nextSection}
            hasAnswers={hasAnswers}
            questionsInProgress={questionsInProgress}
            currentQuestionIndex={currentQuestionIndex}
          />
        </div>
      )}
    </PopupBody>
  );
};

export default ShowPracticeQuestions;
