import { HTMLElement } from '@openstax/types/lib.dom';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import classNames from 'classnames';
import GoToTopButton from '../../../components/GoToTopButton';
import theme from '../../../theme';
import { loadMoreDistanceFromBottom } from '../../constants';
import { PopupBody } from '../../styles/PopupStyles';
import { loadMoreStudyGuides } from '../actions';
import * as select from '../selectors';
import Filters from './Filters';
import StudyGuides from './StudyGuides';
import StudyGuidesCTA from './StudyGuidesCTA';
import StudyGuidesToasts from './StudyGuidesToasts';
import './ShowStudyGuides.css';

// Export PopupBody as StudyGuidesBody for test compatibility
// The actual styling is now in ShowStudyGuides.css
export const StudyGuidesBody = PopupBody;

const ShowStudyGuides = ({topElRef}: {topElRef: React.RefObject<HTMLElement>}) => {
  const ref = React.useRef<HTMLElement>(null);
  const [showGoToTop, setShowGoToTop] = React.useState(false);
  const dispatch = useDispatch();
  const isLoading = useSelector(select.summaryIsLoading);
  const hasMoreResults = useSelector(select.hasMoreResults);
  const studyGuides = useSelector(select.summaryStudyGuides);

  React.useEffect(() => {
    if (studyGuides && !Object.keys(studyGuides).length && hasMoreResults && !isLoading) {
      dispatch(loadMoreStudyGuides());
    }
  }, [studyGuides, hasMoreResults, isLoading, dispatch]);

  const goToTop = () => {
    const refElement = ref.current;

    if (!refElement) {
      return;
    }

    refElement.scrollTop = 0;
    topElRef.current?.focus();
    setShowGoToTop(false);
  };

  const fetchMoreStudyGuides = (refElement: HTMLElement) => {
    if (isLoading || !hasMoreResults) {
      return;
    }

    const scrollBottom = refElement.scrollHeight - refElement.offsetHeight - refElement.scrollTop;
    if (scrollBottom <= loadMoreDistanceFromBottom) {
      dispatch(loadMoreStudyGuides());
    }
  };

  return (
    <PopupBody
      ref={ref}
      className={classNames('study-guides-body')}
      style={{
        '--study-guides-bg': theme.color.neutral.darker,
      } as React.CSSProperties}
      onScroll={() => {
        const refElement = ref.current;

        if (!refElement) {
          return;
        }

        setShowGoToTop(refElement.scrollTop > 0);
        fetchMoreStudyGuides(refElement);
      }}
      data-testid='show-studyguides-body'
      data-analytics-region='SG popup'
    >
      <StudyGuidesToasts />
      <StudyGuidesCTA />
      <Filters />
      <StudyGuides />
      {showGoToTop && <GoToTopButton
        i18nAriaLabel='i18n:toolbar:studyguides:popup:button:back-to-top'
        onClick={goToTop}
        data-testid='back-to-top-studyguides'
      />}
    </PopupBody>
  );
};

export default ShowStudyGuides;
